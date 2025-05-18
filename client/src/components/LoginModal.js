import '../styles/LoginModal.css';

import { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

function LoginModal({ onClose }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const modalRef = useRef(); // referencia para el modal

  // toggle para mostrar u ocultar contraseña
  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  // cerrar el modal si se hace click fuera de él
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();  // Cierra el modal
    }
  };

  // listener para el click fuera del modal
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);

    // limpia el eventlistener cuando se sale del modal
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // solicitud al backend para inicio de sesión o registro
  const handleSubmit = async (e) => {
    e.preventDefault();

    // para registro
    if (isRegistering) {      
      try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registro exitoso:', data);
        // Podrías guardar el token si el backend lo envía:
        // localStorage.setItem('token', data.token);
        onClose(); // o redirigir, o cambiar a login
      } else {
        console.error('Error en registro:', data.message);
        alert(data.message || 'Error al registrar');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('No se pudo conectar con el servidor');
    }
    } else {
      console.log('Login:', {
        email,
        password,
      });
      // Aquí iría tu lógica de login
    }
  };


  return (
    <div className="modal-overlay">
      <div className="modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="Nombre y apellidos"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            </>
          )}

          {!isRegistering && (
            <input
              type="text"
              placeholder="Email o nombre de usuario"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
            />
          )}

          <div className="password-input-container">
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

          <button type="submit">{isRegistering ? 'Registrarse' : 'Entrar'}</button>
        </form>
        <div className="additional-options">
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>

          {!isRegistering && (
            <button onClick={() => console.log('Recuperar contraseña')}>
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
