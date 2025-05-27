import '../../styles/ProfilePage.css';

import { useState, useEffect, useContext } from 'react';
import { FaSeedling, FaLeaf, FaInfoCircle, FaTrophy } from 'react-icons/fa';
import { FaTree, FaApple, FaCrown, FaStar } from 'react-icons/fa';
import { FaTrashAlt, FaPen, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { useUserContext } from '../../context/UserContext';
import UserEditModal from '../UserEditModal';
import ChangePasswordModal from '../ChangePasswordModal';
import { convertUTCDateTime } from '../../utils/functions';


function ProfilePage() {
  const [user, setUserLocal] = useState(null);
  const { setUserGlobalContext } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [avatarTimestamp, setAvatarTimestamp] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationMessageType, setNotificationMessageType] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const avatarsUrl = process.env.REACT_APP_AVATAR_IMAGES_URL;

  // Datos de prueba del usuario
  // const user = {
  //   photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
  //   name: 'Juan José Dominguez Gutierrez',
  //   email: 'juanperez@gmail.com',
  //   password: '123456',
  //   messages: [
  //     { id: 1, type: 'sent', content: '¿Dónde puedo reciclar botellas de vidrio?' },
  //     { id: 2, type: 'reply', content: 'Puedes encontrar puntos de reciclaje en la aplicación.' },
  //   ],
  //   score: 45,
  //   level: 'beginner',
  //   recyclingActivities: [
  //     { id: 1, activity: 'Reciclaje de plástico', date: '10-03-2025' },
  //     { id: 2, activity: 'Reciclaje de papel', date: '15-04-2025' },
  //   ],
  // };

  // Petición al backend para obtener los datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('usertoken');

        // petición de datos del usuario
        const resUser = await fetch(`${apiUrl}/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await resUser.json();

        if (!resUser.ok) {
          console.error('Error al obtener usuario:', data.msg);
        }

        setUserLocal({
          avatar: `${avatarsUrl}/${data.avatar}`,
          fullname: data.fullname,
          email: data.email,
          username: data.username,
          score: data.score,
          level: data.level, // objeto completo con los datos del nivel
          recyclingActivities: data.recyclingActivities,
          messages: data.messages,
        });
      } catch (error) {
        console.error('Error de red:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // maneja el click en el botón de editar perfil
  const handleEditProfileClick = () => {
    // muestra el modal de editar perfil
    setShowEditProfile(true);
  };

  // maneja el click en el botón de cambiar contraseña
  const handleChangePassswordClick = () => {
    // muestra el modal de cambio de contraseña
    setShowChangePassword(true);
  };

  // mostrar mensaje temporal
  const showTempNotification = (msg, type, duration) => {
    setNotificationMessage(msg);
    setNotificationMessageType(type);
    setTimeout(() => setNotificationMessage(''), duration);
  };

  // guardado de los datos de edición de perfil,
  // actualiza los datos del usuario en la base de datos
  const handleEditProfileSave = async (updatedData, selectedImageFile) => {
    let avatarUpdated = false;
    // solicitud a la API para actualizar los datos en la base de datos
    try {
      const token = localStorage.getItem('usertoken');  // token del usuario      

      // si se ha actualizado username o email, se comprueba si ya están en uso
      const isUsernameChanged = updatedData.username !== user.username;
      const isEmailChanged = updatedData.email !== user.email;
      if (isUsernameChanged || isEmailChanged) {
        try {
          const checkRes = await fetch(`${apiUrl}/user/check-updated-data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: isUsernameChanged ? updatedData.username : null,
              email: isEmailChanged ? updatedData.email : null,
            }),
          });

          const checkData = await checkRes.json();

          if (!checkRes.ok) { // si devuelve mensaje de error
            if (checkData.error === 'USERNAME_EXISTS') {
              showTempNotification('El nombre de usuario introducido ya está en uso.', 'error', 3000);
            } else if (checkData.error === 'EMAIL_EXISTS') {
              showTempNotification('El correo electrónico introducido ya está en uso.', 'error', 3000);
            } else {   
              showTempNotification('Error al verificar los datos.\nIntentálo más tarde.', 'error', 3000);
              console.error('Error al verificar duplicados:', checkData.error);             
            }

            return;
          }
        } catch (error) {
          showTempNotification('Error al verificar los datos.\nIntentálo más tarde.', 'error', 3000);
          console.error('Error al verificar duplicados:', error);

          return;
        }
      }
      
      // se mandan los datos actualizados del usuario
      const updateRes = await fetch(`${apiUrl}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // envía el token del usuario
        },
        body: JSON.stringify(updatedData),  // envía los nuevos datos del usuario
      });

      // // si no se va a actualizar el avatar
      // if (!selectedImageFile && user.avatar.startsWith(avatarsUrl)) {
      //   updatedData.avatar = user.avatar.replace(`${avatarsUrl}/`, ''); // extrae solo el nombre del archivo
      // }

      // // se mandan los datos actualizados del usuario
      // const updateRes = await fetch(`${apiUrl}/user/update`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,  // envía el token del usuario
      //   },
      //   body: JSON.stringify(updatedData),  // envía los nuevos datos del usuario
      // });

      // se espera confirmación de actualización en base de datos
      const data = await updateRes.json();

      if (!updateRes.ok) { // si responde con error
        showTempNotification('Los datos no se han podido actualizar.\nInténtalo más tarde.', 'error', 3000);
        console.error('Error al actualizar:', data.msg);
        return;
      }

      // si se ha actualizado el avatar, se sube el fichero al servidor
      let newAvatarFilename = user.avatar;
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('filename', `${"avatar-"}${updatedData.username}`); // se nombra el fichero con el nombre de usuario
        formData.append('avatar', selectedImageFile);

        const uploadRes = await fetch(`${apiUrl}/user/upload-avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadedImageData = await uploadRes.json(); // datos de la imagen subida, incluye uploadDir y fullFilename

        if (!uploadRes.ok) { // si hay error en la subida
          showTempNotification('El avatar no se han podido actualizar.\nInténtalo más tarde.', 'error', 3000);
          console.error('Error al actualizar:', data.msg);

          return;
        }

        // // se actualiza la ruta del avatar en los datos del usuario
        // updatedData.avatar = uploadedImageData.fullFilename; //ej: miavatar.jpg
        // avatarUpdated = true;

        newAvatarFilename = uploadedImageData.fullname;

        // 🔹 Paso 3: Actualizar solo el avatar
      const avatarRes = await fetch(`${apiUrl}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: newAvatarFilename }),
      });

      if (!avatarRes.ok) {
        showTempNotification('Error al actualizar el avatar.', 'error', 3000);
        return;
      }

        // recarga del avatar en la imagen
        setAvatarTimestamp(Date.now());
      }

      // se va a cambiar el nombre de la imagen por la ruta completa
      // para almacenarlo en los datos de usuario locales y del contexto global        
      // if (selectedImageFile){ // si se editó el avatar
      //   // se actualiza la ruta relativa de la imagen del avatar
      //   updatedData.avatar = `${avatarsUrl}/${updatedData.avatar}`;
      // } 

      // updatedData.avatar = `${avatarsUrl}/${data.avatar}`;

      const updatedUser = {
        ...user,
        ...updatedData,
        avatar: `${avatarsUrl}/${newAvatarFilename}`
      }
      
      setUserLocal(updatedUser);

      setUserGlobalContext({
        username: updatedUser.username,
        avatar: updatedUser.avatar,
      });

      // // se actualizan los datos de usuario en el contexto local:
      // // copia todos los campos de user y los actualiza con los de updatedData
      // setUserLocal({
      //   ...user,
      //   ...updatedData,
      // });

      // // se actualizan los datos de usuario en el contexto global
      // setUserGlobalContext({
      //   username: updatedData.username,
      //   avatar: updatedData.avatar,
      // });

      // se muestra mensaje de confirmación
      showTempNotification('Datos actualizados correctamente.', 'success', 2000);

      // pasado un tiempo cierra el modal
      setTimeout(() => { setShowEditProfile(false); }, 2000);        
    } catch (error) {     
      showTempNotification('No se ha podido conectar con el servidor.\nInténtalo de nuevo más tarde.', 'error', 3000); 
      console.error('Error de red:', error);
    }
    return avatarUpdated;
  };

  // guardado de la nueva contraseña,
  // actualiza la contraseña del usuario en la base de datos
  const handleChangePasswordSave = async ({ oldPassword, newPassword, confirmPassword  }) => {
    if (newPassword !== confirmPassword ) {
      showTempNotification('La nueva contraseña y la confirmación no coinciden.', 'error', 3000);

      return;
    }

    try {
      const token = localStorage.getItem('usertoken');

      const resChangePassword = await fetch(`${apiUrl}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const dataChangePassword = await resChangePassword.json();

      if (resChangePassword.ok) {
        showTempNotification('Contraseña cambiada correctamente.', 'success', 2000);

        // cierra el modal
        setTimeout(() => { setShowChangePassword(false); }, 2000);
      } else {
        if (dataChangePassword.error === 'WRONG_CURRENT_PASS') {
          showTempNotification('La contraseña actual introducida no es correcta.', 'error', 3000);
        } else {
          showTempNotification('Error al cambiar la contraseña. Inténtalo de nuevo.', 'error', 3000);
        }        
      }
    } catch (error) {
      showTempNotification('No se pudo conectar con el servidor.', 'error', 2000);
      console.error('Error de red:', error);
    }
  }

  function getLevelIcon(iconName) {
    const icons = {
      FaSeedling: <FaSeedling />,
      FaLeaf: <FaLeaf />,
      FaTree: <FaTree />,
      FaApple: <FaApple />,
      FaCrown: <FaCrown />,
      FaStar: <FaStar />
    };

    return icons[iconName] || null;
  }


  if (loading || !user) return <div className="loading"></div>;

  return (
    <div className="profile-container">
      <div className="body-section">
        <div className='box-content-1'>
          <div className="profile-data">
            <img className="profile-photo" src={`${user.avatar}${avatarTimestamp ? `?t=${avatarTimestamp}` : ''}`} alt="Foto de usuario" />
            <div className="profile-info">
              <h2 className="user-name">{user.fullname}</h2>
              <p className="user-email">{user.email}</p>
              <div className="profile-edit">
                <button onClick={handleEditProfileClick} className="profile-edit-link">Editar perfil</button>
                <button onClick={handleChangePassswordClick} className="change-password-link">Cambiar contraseña</button>
              </div>
            </div>
          </div>

          <div className="div-line" />

          <div className="profile-score">            
            <div className="user-level">
              <div className="level-info" style={{ color: user.level.color }}>
                {getLevelIcon(user.level.icon)}
                <span>{user.level.text}</span>
                <div className="tooltip-container">
                    <FaInfoCircle />
                    <div className="tooltip">
                        <p>Este es el rango de tu usuario.</p>
                        <p>Cada vez que realices acciones de reciclaje conseguirás 
                            puntos que te permitirán subir de rango.</p>
                    </div>
                </div>
              </div>
              <div className="user-points">
                <FaTrophy />
                <span>{user.score} puntos</span>
                {/* Animación del icono con hover */}
                <FaAngleDown className="angle-icon down" />
                <FaAngleUp className="angle-icon up" />
                    <div className="tooltip">
                        <div className="score-number">{user.score}</div>
                        <div className="progress-bar-container">
                            <div
                            className="progress-bar"
                            style={{ width: `${(user.score / user.level.maxScore) * 100}%` }}
                            ></div>
                        </div>
                        <div className="score-number">{user.level.maxScore}</div>
                    </div>                
              </div>
            </div>
            <h3>Actividades de Reciclaje</h3>
            {user.recyclingActivities && user.recyclingActivities.length > 0 ? (
              <div className="scrollable-list">
                <ul>
                  {user.recyclingActivities
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // ordena de más nuevas a más viejas
                    .map((activity) => (
                      <li key={activity._id}>
                        {activity.type} - {convertUTCDateTime(activity.date)}
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <p className="empty-message">
                Aún no has realizado actividades de reciclaje. ¡Empieza hoy para ayudar al planeta!
              </p>
            )}            
          </div>
        </div>

        <div className="box-content-2">
          <div className="profile-messages">
            <h3>Mensajes en la comunidad</h3>
            <div className="messages-list">
              <h4>Temas iniciados:</h4>
              <div className="scrollable-message-section">
                {user.messages && user.messages.filter(msg => msg.type === 'post').length > 0 ?(
                  user.messages
                    .filter(msg => msg.type === 'post')
                    .map((msg) => (
                      <div className="message" key={msg._id}>
                        <p>{msg.content}</p>
                        <div className="message-actions">
                          <button className="edit-btn"><FaPen /></button>
                          <button className="delete-btn"><FaTrashAlt /></button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="empty-message">
                    Aún no has iniciado ningún tema. ¡Comparte tus ideas con la comunidad!
                  </p>
                )}
              </div>
              <h4>Mensajes de respuesta:</h4>
              <div className="scrollable-message-section">
                {user.messages && user.messages.filter(msg => msg.type === 'reply').length > 0 ? (
                  user.messages
                    .filter(msg => msg.type === 'reply')
                    .map((msg) => (
                      <div className="message" key={msg._id}>
                        <p>{msg.content}</p>
                      </div>
                    ))
                ) : (
                  <p className="empty-message">
                    No tienes mensajes de respuesta todavía. ¡Anímate a participar!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* modal para editar el perfil de usuario */}
      {showEditProfile && 
        <UserEditModal
          userData={user}
          onSave={handleEditProfileSave}
          setNotificationMessage={setNotificationMessage}
          setNotificationMessageType={setNotificationMessageType}
          notificationMessage={notificationMessage}
          notificationMessageType={notificationMessageType}
          onClose={() => setShowEditProfile(false)} />}

      {/* modal para editar la contraseña */}
      {showChangePassword && 
        <ChangePasswordModal
          userData={user}
          onSave={handleChangePasswordSave}
          setNotificationMessage={setNotificationMessage}
          setNotificationMessageType={setNotificationMessageType}
          notificationMessage={notificationMessage}
          notificationMessageType={notificationMessageType}
          onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}

export default ProfilePage;
