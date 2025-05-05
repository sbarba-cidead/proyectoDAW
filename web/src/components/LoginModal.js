import React, { useState, useEffect, useRef } from 'react';
import '../styles/LoginModal.css';  // Ruta actualizada del CSS

// Importamos los iconos
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

function LoginModal({ onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Referencia para el modal
  const modalRef = useRef();

  // Toggle para mostrar/ocultar contraseña
  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  // Cerrar el modal si se hace clic fuera de él
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();  // Cierra el modal
    }
  };

  // Añadir el evento de clic fuera del modal
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={handlePasswordToggle}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit">Entrar</button>
        </form>
        <div className="additional-options">
          <button onClick={() => console.log('Ir a registro')}>¿No tienes cuenta? Regístrate</button>
          <button onClick={() => console.log('Recuperar contraseña')}>¿Olvidaste tu contraseña?</button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
