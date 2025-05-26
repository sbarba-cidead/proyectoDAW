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

        // petición de datos del nivel del usuario
        const levelRes = await fetch(`${apiUrl}/level/get-level/${data.score}`);
        const levelData = await levelRes.json();

        if (!levelRes.ok) {
          console.error('Error al obtener nivel:', levelData.msg);
          return;
        }

        setUserLocal({
          avatar: `${avatarsUrl}/${data.avatar}`,
          fullname: data.fullname,
          email: data.email,
          username: data.username,
          score: data.score,
          level: levelData, // objeto completo con los datos del nivel
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
              setNotificationMessage('El nombre de usuario introducido ya está en uso.');
              setNotificationMessageType('error');
            } else if (checkData.error === 'EMAIL_EXISTS') {
              setNotificationMessage('El correo electrónico introducido ya está en uso.');
              setNotificationMessageType('error');
            } else {              
              setNotificationMessage('Error al verificar los datos.\nIntentálo más tarde.');
              setNotificationMessageType('error');

              console.error('Error al verificar duplicados:', checkData.error);             
            }

            // oculta el mensaje pasado un tiempo
            setTimeout(() => {
              setNotificationMessage('');
            }, 2000); 

            return;
          }
        } catch (error) {
          setNotificationMessage('Error al verificar los datos.\nIntentálo más tarde.');
          setNotificationMessageType('error');

          console.error('Error al verificar duplicados:', error);

          // oculta el mensaje pasado un tiempo
          setTimeout(() => {
            setNotificationMessage('');
          }, 2000);

          return;
        }
      }

      // si se ha actualizado el avatar, se sube el fichero al servidor
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
          setNotificationMessage('El avatar no se han podido actualizar.\nInténtalo más tarde.');
          console.error('Error al actualizar:', data.msg);
          setNotificationMessageType('error');

          // oculta el mensaje pasado un tiempo
          setTimeout(() => {
            setNotificationMessage('');
          }, 2000);

          return;
        }

        // se actualiza la ruta del avatar en los datos del usuario
        updatedData.avatar = uploadedImageData.uploadDir; //ej: miavatar.jpg
        avatarUpdated = true;
      }

      // se mandan los datos actualizados del usuario
      const response = await fetch(`${apiUrl}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // envía el token del usuario
        },
        body: JSON.stringify(updatedData),  // envía los nuevos datos del usuario
      });

      // se espera confirmación de actualización en base de datos
      const data = await response.json();

      if (response.ok) { // si el servidor responde con confirmación exitosa
        // se va a cambiar el nombre de la imagen por la ruta completa
        // para almacenarlo en los datos de usuario locales y del contexto global        
        if (selectedImageFile){ // si se editó el avatar
          // se actualiza la ruta relativa de la imagen del avatar
          updatedData.avatar = `${avatarsUrl}/${updatedData.avatar}`;
        } 

        // se actualizan los datos de usuario en el contexto local:
        // copia todos los campos de user y los actualiza con los de updatedData
        setUserLocal({
          ...user,
          ...updatedData,
        });

        // se actualizan los datos de usuario en el contexto global
        setUserGlobalContext({
          username: updatedData.username,
          avatar: updatedData.avatar,
        });

        // se muestra mensaje de confirmación
        setNotificationMessage('Datos actualizados correctamente.');
        setNotificationMessageType('success');

        // pasado un tiempo
        setTimeout(() => {
          // oculta la notificación
          setNotificationMessage('');

          // cierra el modal
          setShowEditProfile(false);
        }, 2000);        
      } else { // si responde con error
        setNotificationMessage('Los datos no se han podido actualizar.\nInténtalo más tarde.');        
        setNotificationMessageType('error');

        console.error('Error al actualizar:', data.msg);

        // oculta el mensaje pasado un tiempo
        setTimeout(() => {
          setNotificationMessage('');
        }, 2000); 
      }
    } catch (error) {      
      setNotificationMessage('No se ha podido conectar con el servidor.\nInténtalo de nuevo más tarde.');
      setNotificationMessageType('error');

      // oculta el mensaje pasado un tiempo
      setTimeout(() => {
        setNotificationMessage('');
      }, 2000); 

      console.error('Error de red:', error);
    }
    return avatarUpdated;
  };

  // guardado de la nueva contraseña,
  // actualiza la contraseña del usuario en la base de datos
  const handleChangePasswordSave = async ({ oldPassword, newPassword, confirmPassword  }) => {
    if (newPassword !== confirmPassword ) {
      setNotificationMessage('La nueva contraseña y la confirmación no coinciden.');
      setNotificationMessageType('error');
      setTimeout(() => setNotificationMessage(''), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('usertoken');

      const response = await fetch(`${apiUrl}/user/change-password`, {
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

      const data = await response.json();

      if (response.ok) {
        setNotificationMessage('Contraseña cambiada correctamente.');
        setNotificationMessageType('success');

        setTimeout(() => {
          setNotificationMessage('');
          setShowChangePassword(false); // cierra el modal
        }, 2000);
      } else {
        setNotificationMessage('Error al cambiar la contraseña. Inténtalo de nuevo.');
        setNotificationMessageType('error');
        setTimeout(() => setNotificationMessage(''), 3000); // oculta notificación pasado un tiempo
      }
    } catch (error) {
      setNotificationMessage('No se pudo conectar con el servidor.');
      setNotificationMessageType('error');
      setTimeout(() => setNotificationMessage(''), 3000); // oculta notificación pasado un tiempo
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


  if (loading) return <div className="loading"></div>;

  return (
    <div className="profile-container">
      <div className="body-section">
        <div className='box-content-1'>
          <div className="profile-data">
            <img className="profile-photo" src={`${user.avatar}?${Date.now()}`} alt="Foto de usuario" />
            <div className="profile-info">
              <h2 className="user-name">{user.fullname}</h2>
              <p className="user-email">{user.email}</p>
              <div className="profile-edit">
                <a href="#" onClick={handleEditProfileClick} className="profile-edit-link">Editar perfil</a>
                <a href="#" onClick={handleChangePassswordClick} className="change-password-link">Cambiar contraseña</a>
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
              <ul>
                {user.recyclingActivities.map((activity) => (
                  <li key={activity.id}>
                    {activity.type} - {convertUTCDateTime(activity.date)}
                  </li>
                ))}
              </ul>
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
              {user.messages && user.messages.filter(msg => msg.type === 'post').length > 0 ?(
                user.messages
                  .filter(msg => msg.type === 'post')
                  .map((msg) => (
                    <div className="message" key={msg.id}>
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
              <h4>Mensajes de respuesta:</h4>
              {user.messages && user.messages.filter(msg => msg.type === 'reply').length > 0 ? (
                user.messages
                  .filter(msg => msg.type === 'reply')
                  .map((msg) => (
                    <div className="message" key={msg.id}>
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
