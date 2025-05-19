import '../../styles/ProfilePage.css';

import { useState, useEffect, useContext } from 'react';
import { FaSeedling, FaLeaf, FaInfoCircle, FaTrophy } from 'react-icons/fa';
import { FaTree, FaApple, FaCrown, FaStar } from 'react-icons/fa';
import { FaTrashAlt, FaPen, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import UserEditModal from '../UserEditModal';

// Niveles de usuario y sus colores
const levels = {
    beginner: { 
      color: "#467e05",  // Verde
      text: "Principiante", 
      icon: <FaSeedling />  // Icono de semilla
    },
    intermediate: { 
      color: "#118a43",  // Verde azulado oscuro
      text: "Intermedio", 
      icon: <FaLeaf />  // Icono de hoja
    },
    advanced: { 
      color: "#ad7909",  // Marrón
      text: "Avanzado", 
      icon: <FaTree />  // Icono de árbol
    },
    expert: { 
      color: "#921727",  // Rojo oscuro
      text: "Experto", 
      icon: <FaApple />  // Icono de bosque
    },
    master: { 
      color: "#800d94",  // Magenta oscuro
      text: "Maestro", 
      icon: <FaCrown />  // Icono de corona
    },
    legend: { 
      color: "#673AB7",  // Púrpura oscuro
      text: "Leyenda", 
      icon: <FaStar />  // Icono de estrella
    }
  };

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationMessageType, setNotificationMessageType] = useState('');
  const baseUrl = process.env.REACT_APP_API_URL;

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
        const res = await fetch('http://localhost:5000/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          setUser({
            avatar: `${baseUrl}${data.avatar}`,
            fullname: data.fullname,
            email: data.email,
            username: data.username,
            score: data.score,
            level: 'beginner',
            recyclingActivities: [], // se conectará más adelante
            messages: [], // se conectará más adelante
          });
        } else {
          console.error('Error al obtener usuario:', data.msg);
        }
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

  // guardado de los datos de edición de perfil,
  // actualiza los datos del usuario en la base de datos
  const handleSave = async (updatedData, selectedImageFile) => {
    // solicitud a la API para actualizar los datos en la base de datos
    try {
      const token = localStorage.getItem('usertoken');  // token del usuario

      // si se ha actualizado el avatar, se sube el fichero al servidor
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('avatar', selectedImageFile);
        formData.append('username', updatedData.username); // se nombra el fichero con el nombre de usuario

        const uploadRes = await fetch('http://localhost:5000/api/user/upload-avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();

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
        updatedData.avatar = uploadData.avatarUrl;
      }

      // se mandan los datos actualizados del usuario
      const response = await fetch('http://localhost:5000/api/user/update', {
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
        // se actualiza el usuario en contexto global
        setUser({
          ...user,
          ...updatedData,
        });

        // se actualiza el usuario en contexto local de la página
        setUser(updatedData);

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
        console.error('Error al actualizar:', data.msg);
        setNotificationMessageType('error');

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
  };


  if (loading) return <div className="loading">Cargando perfil...</div>;
  // if (isLoadingUser) return <div className="loading">Cargando perfil...</div>;

  return (
    <div className="profile-container">
      <div className="body-section">
        <div className='box-content-1'>
          <div className="profile-data">
            <img className="profile-photo" src={user.avatar} alt="Foto de usuario" />
            <div className="profile-info">
              <h2 className="user-name">{user.fullname}</h2>
              <p className="user-email">{user.email}</p>
              <div className="profile-edit">
                <a href="#" onClick={handleEditProfileClick} className="profile-edit-link">Editar perfil</a>
                <a href="/cambiar-contraseña" className="change-password-link">Cambiar contraseña</a>
              </div>
            </div>
          </div>

          <div className="div-line" />

          <div className="profile-score">            
            <div className="user-level">
              {/* <div className="level-info" style={{ color: levels[user.level].color }}>
                {levels[user.level].icon}
                <span>{levels[user.level].text}</span>
                <div className="tooltip-container">
                    <FaInfoCircle />
                    <div className="tooltip">
                        <p>Este es el rango de tu usuario.</p>
                        <p>Cada vez que realices acciones de reciclaje conseguirás 
                            puntos que te permitirán subir de rango.</p>
                    </div>
                </div>
              </div> */}
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
                            style={{ width: `${(user.score / 100) * 100}%` }}
                            ></div>
                        </div>
                        <div className="score-number">100</div>
                    </div>                
              </div>
            </div>
            <h3>Actividades de Reciclaje</h3>
            {/* <ul>
              {user.recyclingActivities.map((activity) => (
                <li key={activity.id}>
                  {activity.activity} - {activity.date}
                </li>
              ))}
            </ul> */}
          </div>
        </div>

        <div className="box-content-2">
          <div className="profile-messages">
            <h3>Mensajes en la comunidad</h3>
            <div className="messages-list">
              <h4>Temas iniciados:</h4>
              {/* {user.messages.filter(msg => msg.type === 'sent').map((msg) => (
                <div className="message" key={msg.id}>
                  <p>{msg.content}</p>
                  <div className="message-actions">
                    <button className="edit-btn"><FaPen /></button>
                    <button className="delete-btn"><FaTrashAlt /></button>
                  </div>
                </div>
              ))} */}
              <h4>Mensajes de respuesta:</h4>
              {/* {user.messages.filter(msg => msg.type === 'reply').map((msg) => (
                <div className="message" key={msg.id}>
                  <p>{msg.content}</p>
                </div>
              ))} */}
            </div>
          </div>
        </div>
      </div>

      {/* modal para editar el perfil de usuario */}
      {showEditProfile && 
        <UserEditModal
          userData={user}
          onSave={handleSave}
          notificationMessage={notificationMessage}
          notificationMessageType={notificationMessageType}
          onClose={() => setShowEditProfile(false)} />}
    </div>
  );
}

export default ProfilePage;
