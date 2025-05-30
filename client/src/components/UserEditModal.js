import '../styles/UserEditModal.css';

import { useState, useEffect, useRef } from 'react';
import { FaUndo } from 'react-icons/fa'; 
import NotificationMessage from './NotificationMessage';

function UserEditModal({ userData, onSave, setNotificationMessage, setNotificationMessageType,
                          notificationMessage, notificationMessageType, onClose }) {
  const { avatar, fullname, username, email } = userData;
  const [editData, setEditData] = useState({
    avatar: avatar, // imagen de avatar con url completa
    fullname: fullname,
    username: username,
    email: email,
  });
  const [initialData, setInitialData] = useState({ avatar, fullname, username, email });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [reloadImage, setReloadImage] = useState(false);
  
  const modalRef = useRef();
  const fileInputRef = useRef();

 
  // función para manejar click en el avatar
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // función para manejar selección de nuevo avatar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];    
    if (!allowedTypes.includes(file.type)) {
      setNotificationMessage('Formato de imagen no válido.\nFormatos soportados: jpg, png')
      setNotificationMessageType('error');

      // pasado un tiempo
      setTimeout(() => {
        // oculta la notificación
        setNotificationMessage('');
      }, 3000);

      //reinicia valor del input file
      e.target.value = null;

      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditData({ ...editData, avatar: reader.result }); // dataURL para vista previa
      setSelectedImageFile(file); // guarda el archivo para posterior subida
    };
    reader.readAsDataURL(file);
  };

  // función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  // función para resetear un campo al valor inicial
  const handleReset = (field) => {
    setEditData({
      ...editData,
      [field]: initialData[field],
    });
  };

  // para mostrar mensaje de notificicación
  const showTempNotification = (msg, type, duration) => {
    setNotificationMessage(msg);
    setNotificationMessageType(type);
    setTimeout(() => setNotificationMessage(''), duration);
  };

  // validaciones básicas en front para el formulario
  const validateForm = () => {
    if (!editData.fullname || !editData.username || !editData.email) {
      showTempNotification('Por favor, rellena todos los campos.', 'error', 2000);
      return false;
    }

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}$/;
    if (!nameRegex.test(editData.fullname)) {
      showTempNotification('El nombre completo solo puede contener letras y debe tener entre 3 y 50 caracteres.', 'error', 4000);
      return false;
    }

    const usernameRegex = /^[A-Za-z0-9._-]{3,30}$/;
    if (!usernameRegex.test(editData.username)) {
      showTempNotification('El nombre de usuario solo puede contener letras, números, ".", "-" y "_" y debe tener entre 3 y 30 caracteres.', 'error', 4000);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      showTempNotification('Introduce un correo electrónico válido.', 'error', 3000);
      return false;
    }

    return true;
  };

  // función para manejar la confirmación al guardar
  const handleSubmit = async (e) => {
    e.preventDefault();

    // verificación si no se ha cambiado nada
    const isSameData =
      editData.fullname === initialData.fullname &&
      editData.username === initialData.username &&
      editData.email === initialData.email &&
      !selectedImageFile;

    if (isSameData) {
      showTempNotification('No se han realizado cambios.\nLos datos introducidos son los originales.', 'info', 4000);
      return;
    }

    // validaciones básicas de formato en front
    if (!validateForm()) return;
    
    // llama a la función de guardado en BD
    // y le pasa los nuevos datos del usuario
    const wasAvatarEdited = await onSave(editData, selectedImageFile);

    if (wasAvatarEdited) {
      setReloadImage(true); // fuerza actualización del avatar en el modal
    }
  };

  return (
    <div className="modal-overlay">
      {notificationMessage && 
        <NotificationMessage
          textMessage={notificationMessage}
          notificationType={notificationMessageType} />
      }
      <div className="modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Editar perfil</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Foto de usuario */}
          <div className="profile-photo-container" onClick={handleAvatarClick}>
            <img 
              className="profile-photo" 
              src={selectedImageFile && !reloadImage ? editData.avatar : `${editData.avatar}?${Date.now()}`}
              alt="Foto de usuario" />
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/jpeg, image/png"
              onChange={handleImageChange}
            />
          </div>
          
          {/* Input Fullname */}
          <div className="input-container">
            <input
              type="text"
              name="fullname"
              placeholder="Nombre completo"
              value={editData.fullname.trim()}
              onChange={handleInputChange}
            />
            <div className="reset-icon">
              <FaUndo onClick={() => handleReset('fullname')} />
            </div>
          </div>

          {/* Input Username */}
          <div className="input-container">
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={editData.username.trim()}
              onChange={handleInputChange}
            />
            <div className="reset-icon">
              <FaUndo onClick={() => handleReset('username')} />
            </div>
          </div>

          {/* Input Email */}
          <div className="input-container">
            <input
              type="text"
              name="email"
              placeholder="Correo electrónico"
              value={editData.email.trim()}
              onChange={handleInputChange}
            />
            <div className="reset-icon">
              <FaUndo onClick={() => handleReset('email')} />
            </div>
          </div>

          {/* Botón para guardar */}
          <button type="submit" className="submit-btn">Guardar cambios</button>
        </form>
      </div>
    </div>
  );
}

export default UserEditModal;
