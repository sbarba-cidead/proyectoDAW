import '../styles/LoginModal.css';

import { useUserContext } from '../context/UserContext';
import { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash, FaTimesCircle } from 'react-icons/fa'; 

function LoginModal( { initialFormData, formData, setFormData, handleInputChange, onClose } ) {
  const { setUserGlobalContext } = useUserContext();
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationMessageType, setNotificationMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isRegistering, credential, password, fullname, username, email } = formData;
  const modalRef = useRef(); // referencia para el modal
  const apiUrl = process.env.REACT_APP_API_URL;
  const avatarsUrl = process.env.REACT_APP_AVATAR_IMAGES_URL;

  // toggle para mostrar u ocultar contraseña
  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  // cierra el modal si se hace click fuera de él
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();  // cierra el modal
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    // limpia el eventlistener cuando se sale del modal
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // para mostrar mensaje de notificicación
  const showTempNotification = (msg, type, duration) => {
    setNotificationMessage(msg);
    setNotificationMessageType(type);
    setTimeout(() => setNotificationMessage(''), duration);
  };

  // validaciones básicas en front para el formulario
  const validateForm = () => {
    if (isRegistering) {
      if (!fullname || !username || !email || !password) {
        showTempNotification('Todos los campos son obligatorios.', 'error', 2000);
        return false;
      }

      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}$/;
      if (!nameRegex.test(fullname)) {
        showTempNotification('El nombre completo solo puede contener letras y debe tener entre 3 y 50 caracteres.', 'error', 4000);
        return false;
      }

      const usernameRegex = /^[A-Za-z0-9._-]{3,30}$/;
      if (!usernameRegex.test(username)) {
        showTempNotification('El nombre de usuario solo puede contener letras, números, ".", "-" y "_" y debe tener entre 3 y 30 caracteres.', 'error', 4000);
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showTempNotification('Introduce un correo electrónico válido.', 'error', 3000);
        return false;
      }

    } else {
      if (!credential || !password) {
        showTempNotification('Todos los campos son obligatorios.', 'error', 2000);
        return false;
      }
    }

    return true;
  };

  // solicitud al backend para inicio de sesión o registro
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    if (isRegistering) {  // para registro   
      try {
        const response = await fetch(`${apiUrl}/auth/register`, {
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
          showTempNotification('Nuevo usuario registrado correctamente.', 'success', 2000);

          // pasado un tiempo, limpia los campos y redirige a login
          setTimeout(() => { setFormData(initialFormData); }, 2000); 
        } else {
          if (data.msg?.includes('email')) {
            showTempNotification('El correo electrónico ya está en uso.', 'error', 2000);
          } else if (data.msg?.includes('nombre')) {
            showTempNotification('El nombre de usuario ya está en uso.', 'error', 2000);
          } else {
            showTempNotification('No se ha podido registrar.\nInténtalo más tarde.', 'error', 3000);
            if (process.env.NODE_ENV !== 'production') { console.warn('Error en registro:', data.msg); }
          }
        }
      } catch (error) {
        showTempNotification('No se ha podido conectar con el servidor.\nInténtalo de nuevo más tarde.', 'error', 3000);
        if (process.env.NODE_ENV !== 'production') { console.warn('Error de red:', error); }
      }
    } else { // para login
       try {
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // guarda el token de forma persistente
          localStorage.setItem('usertoken', data.token);

          // guarda el nombre de usuario y su foto
          // en el contexto global del usuario
          setUserGlobalContext({
            username: data.user.username,
            avatar: `${avatarsUrl}/${data.user.avatar}`, // guarda con la url completa
          });

          // muestra mensaje de confirmación
          showTempNotification('Se ha iniciado sesión correctamente.', 'success', 2000);

          // pasado un tiempo
          setTimeout(() => {
            // limpia los campos
            setFormData(initialFormData);

            // cierra el modal
            onClose();
          }, 2000);
        } else {
          if (data.error === 'USERNAME_NOT_EXISTS') {
            showTempNotification('El nombre de usuario introducido no existe.', 'error', 3000);
          } else if (data.error === 'EMAIL_NOT_EXISTS') {
            showTempNotification('El email introducido no existe.', 'error', 2000);
          } else if (data.error === 'WRONG_PASSWORD') {
            showTempNotification('La contraseña introducida no es correcta.', 'error', 3000);
          } else {
            showTempNotification('No se pudo iniciar sesión.\nInténtalo más tarde.', 'error', 3000);
            if (process.env.NODE_ENV !== 'production') { console.warn('Error en inicio de sesión:', data.msg); }
          }
        }
      } catch (error) {
        showTempNotification('No se ha pudido conectar con el servidor.\nInténtalo más tarde.', 'error', 3000);
        if (process.env.NODE_ENV !== 'production') { console.warn('Error de red:', error); }
      }
    }
  };


  return (
    <div className="login-modal-main">
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
        <h2>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="fullname"
                  placeholder="Nombre y apellidos"
                  value={fullname.trim()}
                  onChange={handleInputChange}
                />
                {fullname && (
                  <FaTimesCircle
                    className="clear-icon"
                    onClick={() => setFormData(prev => ({ ...prev, fullname: '' }))}
                  />
                )}
              </div>
              <div className="input-wrapper">
                  <input
                  type="text"
                  name="username"
                  placeholder="Nombre de usuario"
                  value={username.trim()}
                  onChange={handleInputChange}
                />
                {username && (
                  <FaTimesCircle
                    className="clear-icon"
                    onClick={() => setFormData(prev => ({ ...prev, username: '' }))}
                  />
                )}
              </div>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="email"
                  placeholder="Correo electrónico"
                  value={email.trim()}
                  onChange={handleInputChange}
                />
                {email && (
                  <FaTimesCircle
                    className="clear-icon"
                    onClick={() => setFormData(prev => ({ ...prev, email: '' }))}
                  />
                )}
              </div>
            </>
          )}

          {!isRegistering && (
            <div className="input-wrapper">
              <input
                type="text"
                name="credential"
                placeholder="Email o nombre de usuario"
                value={credential.trim()}
                onChange={handleInputChange}
              />
              {credential && (
                <FaTimesCircle
                  className="clear-icon"
                  onClick={() => setFormData(prev => ({ ...prev, credential: '' }))}
                />
              )}
            </div>            
          )}

          <div className="input-password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Contraseña"
              value={password.trim()}
              onChange={handleInputChange}
            />

            {/* X para limpiar contraseña */}
            {password && (
              <FaTimesCircle
                className="clear-icon"
                onClick={() => setFormData(prev => ({ ...prev, password: '' }))}
              />
            )}

            {/* ojo para mostrar/ocultar contraseña */}
            <span className="password-toggle" onClick={handlePasswordToggle}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">{isRegistering ? 'Registrarse' : 'Entrar'}</button>
        </form>
        <div className="additional-options">
          <button onClick={() => {setFormData(prev => ({...initialFormData, isRegistering: !isRegistering}))}}>
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
