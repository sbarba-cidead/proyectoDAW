import 'styles/modals/LoginModal.css';

import { useUserContext } from 'context/UserContext';
import { useState, useRef, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaTimesCircle } from 'react-icons/fa'; 
import NotificationMessage from 'components/page-elements/NotificationMessage';

function LoginModal( { initialFormData, formData, setFormData, handleInputChange, onClose } ) {
  const { setUserGlobalContext } = useUserContext();
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationMessageType, setNotificationMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const { isRegistering, credential, password, fullname, username, email } = formData;
  const modalRef = useRef(); // referencia para el modal
  const apiUrl = process.env.REACT_APP_API_URL;
  const avatarsUrl = process.env.REACT_APP_AVATAR_IMAGES_URL;


  // comprobación de conexión con el servidor
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch(`${apiUrl}/user/ping`);
        if (!response.ok) {
          throw new Error('No response OK');
        }
      } catch (error) {
        showTempNotification(
          'Actualmente no hay conexión con el servidor.\nInténtalo de nuevo.',
          'error',
          8000
        );
      }
    };

    checkServerConnection();
  }, []);

  // toggle para mostrar u ocultar contraseña
  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  // para mostrar mensaje de notificicación
  const showTempNotification = (msg, type, duration) => {
    setNotificationMessage(msg);
    setNotificationMessageType(type);
    setTimeout(() => setNotificationMessage(''), duration);
  };

  // validaciones básicas en front para el formulario
  const validateForm = () => {
    if (isRegistering) {
      if (!fullname.trim() || !username.trim() || !email.trim() || !password.trim()) {
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

    } else if (isRecoveringPassword) {
      if (!email.trim()) {
        showTempNotification('El correo electrónico es obligatorio.', 'error', 3000);
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        showTempNotification('Introduce un correo electrónico válido.', 'error', 3000);
        return false;
      }
    } else { // login
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
            fullname: fullname.trim(),
            username: username.trim(),
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          showTempNotification('Nuevo usuario registrado correctamente.', 'success', 2000);

          // pasado un tiempo, limpia los campos y redirige a login
          setTimeout(() => { setFormData(initialFormData); }, 2000); 
        } else {
          if (data.error?.includes('email')) {
            showTempNotification('El correo electrónico ya está en uso.', 'error', 2000);
          } else if (data.error?.includes('nombre')) {
            showTempNotification('El nombre de usuario ya está en uso.', 'error', 2000);
          } else {
            showTempNotification('No se ha podido registrar.\nInténtalo más tarde.', 'error', 3000);
            if (process.env.NODE_ENV !== 'production') { console.warn('Error en registro:', data.error); }
          }
        }
      } catch (error) {
        showTempNotification('No se ha podido conectar con el servidor.\nInténtalo de nuevo más tarde.', 'error', 3000);
        if (process.env.NODE_ENV !== 'production') { console.warn('Error de red:', error); }
      }
    } else if (isRecoveringPassword) { // recuperación de contraseña
      try {
        const response = await fetch(`${apiUrl}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          showTempNotification('Si tu correo electrónico está registrado recibirás un email de recuperación.', 'success', 3000);
          setTimeout(() => {
            setFormData(initialFormData);
            setIsRecoveringPassword(false);
          }, 4000);
        } else {          
          showTempNotification('No se pudo enviar el correo de recuperación.', 'error', 3000);
          if (process.env.NODE_ENV !== 'production') { console.warn('Error en solicitud recuperación de contraseña:', data.error); }
        }
      } catch (error) {
        showTempNotification('Error al conectar con el servidor.', 'error', 3000);
        if (process.env.NODE_ENV !== 'production') { console.warn('Error:', error); }
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
            role: data.user.role,
            banned: data.user.banned,
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
            if (process.env.NODE_ENV !== 'production') { console.warn('Error en inicio de sesión:', data.error); }
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
      {notificationMessage && 
        <NotificationMessage
          textMessage={notificationMessage}
          notificationType={notificationMessageType} />
      }
      <div className="modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{isRecoveringPassword ? 'Recuperar contraseña' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        <form onSubmit={handleSubmit}>
          {isRecoveringPassword && (
            <div className="input-wrapper">
              <input
                type="text"
                name="email"
                placeholder="Introduce tu correo electrónico"
                value={email}
                onChange={handleInputChange}
              />
              {email && (
                <FaTimesCircle
                  className="clear-icon"
                  onClick={() => setFormData(prev => ({ ...prev, email: '' }))}
                />
              )}
            </div>
          )}

          {isRegistering && !isRecoveringPassword && (
            <>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="fullname"
                  placeholder="Nombre y apellidos"
                  value={fullname}
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
                  value={username}
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
                  value={email}
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

          {!isRegistering && !isRecoveringPassword && (
            <div className="input-wrapper">
              <input
                type="text"
                name="credential"
                placeholder="Email o nombre de usuario"
                value={credential}
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

          {!isRecoveringPassword && (
            <div className="input-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={password}
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
          )}

          <button type="submit">{isRecoveringPassword ? 'Recuperar contraseña' : isRegistering ? 'Registrarse' : 'Entrar'}</button>
        </form>
        <div className="additional-options">
            {isRecoveringPassword && (
              <button onClick={() => setIsRecoveringPassword(false)}>
                Volver
              </button>
            )}

            {!isRecoveringPassword && (
              <button onClick={() => {setFormData(prev => ({...initialFormData, isRegistering: !isRegistering}))}}>
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            )}

            {!isRegistering && !isRecoveringPassword && (
              <button onClick={() => setIsRecoveringPassword(true)}>
                ¿Olvidaste tu contraseña?
              </button>
            )}     
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
