import '../../styles/ProfilePage.css';

import React, { useState } from 'react';
import { FaSeedling, FaLeaf, FaInfoCircle, FaTrophy } from 'react-icons/fa';
import { FaTree, FaApple, FaCrown, FaStar } from 'react-icons/fa';
import { FaTrashAlt, FaPen, FaAngleDown, FaAngleUp } from 'react-icons/fa';

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
  // Datos de prueba del usuario
  const user = {
    photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    name: 'Juan José Dominguez Gutierrez',
    email: 'juanperez@gmail.com',
    password: '123456',
    messages: [
      { id: 1, type: 'sent', content: '¿Dónde puedo reciclar botellas de vidrio?' },
      { id: 2, type: 'reply', content: 'Puedes encontrar puntos de reciclaje en la aplicación.' },
    ],
    score: 45,
    level: 'beginner',
    recyclingActivities: [
      { id: 1, activity: 'Reciclaje de plástico', date: '10-03-2025' },
      { id: 2, activity: 'Reciclaje de papel', date: '15-04-2025' },
    ],
  };

  return (
    <div className="profile-container">
      <div className="body-section">
        <div className='box-content-1'>
          <div className="profile-data">
            <img className="profile-photo" src={user.photoUrl} alt="Foto de usuario" />
            <div className="profile-info">
              <h2 className="user-name">{user.name}</h2>
              <p className="user-email">{user.email}</p>
              <div className="profile-edit">
                <a href="/editar-perfil" className="profile-edit-link">Editar perfil</a>
                <a href="/cambiar-contraseña" className="change-password-link">Cambiar contraseña</a>
              </div>
            </div>
          </div>

          <div className="div-line" />

          <div className="profile-score">            
            <div className="user-level">
              <div className="level-info" style={{ color: levels[user.level].color }}>
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
                            style={{ width: `${(user.score / 100) * 100}%` }}
                            ></div>
                        </div>
                        <div className="score-number">100</div>
                    </div>                
              </div>
            </div>
            <h3>Actividades de Reciclaje</h3>
            <ul>
              {user.recyclingActivities.map((activity) => (
                <li key={activity.id}>
                  {activity.activity} - {activity.date}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="box-content-2">
          <div className="profile-messages">
            <h3>Mensajes en la comunidad</h3>
            <div className="messages-list">
              <h4>Temas iniciados:</h4>
              {user.messages.filter(msg => msg.type === 'sent').map((msg) => (
                <div className="message" key={msg.id}>
                  <p>{msg.content}</p>
                  <div className="message-actions">
                    <button className="edit-btn"><FaPen /></button>
                    <button className="delete-btn"><FaTrashAlt /></button>
                  </div>
                </div>
              ))}
              <h4>Mensajes de respuesta:</h4>
              {user.messages.filter(msg => msg.type === 'reply').map((msg) => (
                <div className="message" key={msg.id}>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
