import '../styles/ChangePasswordModal.css';

import { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function ChangePasswordModal({ onSave, setNotificationMessage, setNotificationMessageType, 
                              notificationMessage, notificationMessageType, onClose }) {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const modalRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // mostrar mensaje temporal
  const showTempNotification = (msg, type, duration) => {
    setNotificationMessage(msg);
    setNotificationMessageType(type);
    setTimeout(() => setNotificationMessage(''), duration);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // validaciones básicas en front
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      showTempNotification('Por favor, rellena todos los campos.', 'error', 2000);
      return;
    }

    // validaciones básicas en front
    if (formData.newPassword.trim() !== formData.confirmPassword.trim()) {
      showTempNotification('La nueva contraseña y su confirmación no coinciden.', 'error', 3000);
      return;
    }

    onSave(formData);
  };

  return (
    <div className="change-password-modal">
      {notificationMessage && (
        <div className={`notification-message ${notificationMessageType}`}>
          {notificationMessage.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </div>
      )}
      <div className="modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Editar contraseña</h2>
        <form onSubmit={handleSubmit}>

          <div className="password-input-container">
            <input
              type={showOldPassword ? 'text' : 'password'}
              name="oldPassword"
              placeholder="Contraseña antigua"
              value={formData.oldPassword.trim()}
              onChange={handleInputChange}
            />
            <span
              className="password-toggle"
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-input-container">
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="newPassword"
              placeholder="Nueva contraseña"
              value={formData.newPassword.trim()}
              onChange={handleInputChange}
            />
            <span
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirmar nueva contraseña"
              value={formData.confirmPassword.trim()}
              onChange={handleInputChange}
            />
            <span
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">Guardar cambios</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
