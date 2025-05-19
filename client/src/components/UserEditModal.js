import { useState, useEffect, useRef } from 'react';
import { FaUndo } from 'react-icons/fa'; 
import '../styles/UserEditModal.css';

function UserEditModal({ userData, onSave, notificationMessage, notificationMessageType, onClose }) {
  const { avatar, fullname, username, email } = userData;
  const [editData, setEditData] = useState({
    avatar: avatar,
    fullname: fullname,
    username: username,
    email: email,
  });
  const [initialData, setInitialData] = useState({ avatar, fullname, username, email });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const modalRef = useRef();
  const fileInputRef = useRef();

  // cierra el modal si se hace clic fuera de él
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

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
      notificationMessage('Formato de imagen no válido.\nFormatos soportados: jpg, png')
      notificationMessageType('error');

      // pasado un tiempo
      setTimeout(() => {
        // oculta la notificación
        notificationMessage('');

        return;
      }, 2000);      
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

  // función para manejar la confirmación al guardar
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // llama a la función de guardado en BD
    // y le pasa los nuevos datos del usuario
    onSave(editData, selectedImageFile);
  };

  return (
    <div className="modal-overlay">
      {notificationMessage && (
        <div className={`notification-message ${notificationMessageType}`}>
            {notificationMessage.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
        </div>
      )}
      <div className="modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Editar perfil</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Foto de usuario */}
          <div className="profile-photo-container" onClick={handleAvatarClick}>
            <img className="profile-photo" src={editData.avatar} alt="Foto de usuario" />
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
              value={editData.fullname}
              onChange={handleInputChange}
              required
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
              value={editData.username}
              onChange={handleInputChange}
              required
            />
            <div className="reset-icon">
              <FaUndo onClick={() => handleReset('username')} />
            </div>
          </div>

          {/* Input Email */}
          <div className="input-container">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={editData.email}
              onChange={handleInputChange}
              required
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
