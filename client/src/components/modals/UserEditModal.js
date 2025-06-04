import 'styles/modals/UserEditModal.css';

import { useState, useRef, useEffect } from 'react';
import { FaUndo } from 'react-icons/fa'; 
import NotificationMessage from 'components/page-elements/NotificationMessage';

function UserEditModal({ userData, onSave, setNotificationMessage, setNotificationMessageType,
                          notificationMessage, notificationMessageType, onClose }) {
  
  // datos iniciales del usuario, sin editar
  const [initialData, setInitialData] = useState(userData);

  // datos editados del usuario
  // (se inicializan con los datos iniciales)
  const [newEditedData, setNewEditedData] = useState({
    avatar: initialData.avatar, // imagen de avatar con url completa
    fullname: initialData.fullname,
    username: initialData.username,
    email: initialData.email,
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewAvatarURL, setPreviewAvatarURL] = useState(null);
  const [fallbackAvatar, setFallbackAvatar] = useState(initialData.avatar);

  
  const modalRef = useRef();
  const fileInputRef = useRef();


 
  // función para manejar click en el avatar
  const handleAvatarClick = () => {
    // al hacer click en el avatar muestra 
    // el selector de archivos (file input)
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // función para manejar selección de nuevo avatar
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // se toma el primer (y único) fichero del file input
    if (!file) return; // si no hay fichero de imagen, finaliza la función

    // validación de formatos válidos de imagen
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];    
    if (!allowedTypes.includes(file.type)) {
      showTempNotification('Formato de imagen no válido.\nFormatos soportados: jpg, png', 'error', 3000)

      //reinicia valor del file input
      e.target.value = null;

      return;
    }

    // limpieza de objectURL antiguo
    if (previewAvatarURL) {
      URL.revokeObjectURL(previewAvatarURL);
    }

    // para la vista previa de la imagen en el modal de edición
    const objectURL = URL.createObjectURL(file);
    setPreviewAvatarURL(objectURL);

    // se guarda el fichero de imagen en la variable
    setSelectedImageFile(file);
  };

  // función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEditedData({
      ...newEditedData,
      [name]: value,
    });
  };

  // función para resetear un campo al valor inicial
  const handleReset = (field) => {
    setNewEditedData({
      ...newEditedData,
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
    if (!newEditedData.fullname.trim() || !newEditedData.username.trim() || !newEditedData.email.trim()) {
      showTempNotification('Por favor, rellena todos los campos.', 'error', 2000);
      return false;
    }

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}$/;
    if (!nameRegex.test(newEditedData.fullname)) {
      showTempNotification('El nombre completo solo puede contener letras y debe tener entre 3 y 50 caracteres.', 'error', 4000);
      return false;
    }

    const usernameRegex = /^[A-Za-z0-9._-]{3,30}$/;
    if (!usernameRegex.test(newEditedData.username)) {
      showTempNotification('El nombre de usuario solo puede contener letras, números, ".", "-" y "_" y debe tener entre 3 y 30 caracteres.', 'error', 4000);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEditedData.email)) {
      showTempNotification('Introduce un correo electrónico válido.', 'error', 3000);
      return false;
    }

    return true;
  };

  // limpieza de objectURL antiguo
  useEffect(() => {
    return () => {
      if (previewAvatarURL) {
        URL.revokeObjectURL(previewAvatarURL);
      }
    };
  }, [previewAvatarURL]);

  // función para manejar la confirmación al guardar
  const handleSubmit = async (e) => {
    e.preventDefault();

    // verificación si no se ha cambiado nada
    const isSameData =
      newEditedData.fullname.trim() === initialData.fullname &&
      newEditedData.username.trim() === initialData.username &&
      newEditedData.email.trim() === initialData.email &&
      !selectedImageFile;

    if (isSameData) {
      showTempNotification('No se han realizado cambios.\nLos datos introducidos son los originales.', 'info', 4000);
      return;
    }

    // validaciones básicas de formato en front
    if (!validateForm()) return;

    // se calcula el nombre para la imagen de avatar
    let generatedAvatarName = "";
    const currentUsername = newEditedData.username.trim();
    if (selectedImageFile) {      
      const extension = selectedImageFile.name.split('.').pop().toLowerCase(); // extensión del fichero de imagen
      generatedAvatarName = `avatar-${currentUsername}.${extension}`;
    } else {
      const currentAvatar = userData.avatar;
      const currentExtension = currentAvatar.split('.').pop().toLowerCase();
      generatedAvatarName = `avatar-${currentUsername}.${currentExtension}`;
    }

    const trimmedData = {
      fullname: newEditedData.fullname.trim(),
      username: newEditedData.username.trim(),
      email: newEditedData.email.trim(),
      avatar: generatedAvatarName
    };
    
    // pasa los datos a la página de perfil (ProfilePage.js) para la subida/actualización de datos
    await onSave(trimmedData, selectedImageFile);
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
              src={previewAvatarURL || fallbackAvatar}
              alt="Foto de usuario" />
            <input
              type="file"
              ref={fileInputRef} // para abrir el selector de archivo
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
              value={newEditedData.fullname.trim()}
              onChange={handleInputChange}
            />
            <button type="button" className="reset-button">
              <FaUndo className="reset-icon" onClick={() => handleReset('fullname')} />
            </button>
          </div>

          {/* Input Username */}
          <div className="input-container">
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={newEditedData.username.trim()}
              onChange={handleInputChange}
            />
            <button type="button" className="reset-button">
              <FaUndo className="reset-icon" onClick={() => handleReset('username')} />
            </button>
          </div>

          {/* Input Email */}
          <div className="input-container">
            <input
              type="text"
              name="email"
              placeholder="Correo electrónico"
              value={newEditedData.email.trim()}
              onChange={handleInputChange}
            />
            <button type="button" className="reset-button">
              <FaUndo className="reset-icon" onClick={() => handleReset('email')} />
            </button>
          </div>

          {/* Botón para guardar */}
          <button type="submit" className="submit-btn">Guardar cambios</button>
        </form>
      </div>
    </div>
  );
}

export default UserEditModal;
