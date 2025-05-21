import '../styles/LoginModal.css';

import { useUserContext } from '../context/UserContext';
import { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

function LoginModal( { initialFormData, formData, setFormData, handleInputChange, onClose } ) {
  const { setUserGlobalContext } = useUserContext();
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationMessageType, setNotificationMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isRegistering, credential, password, fullname, username, email } = formData;
  const modalRef = useRef(); // referencia para el modal
  const apiUrl = process.env.REACT_APP_API_URL;
  const baseUrl = process.env.REACT_APP_BASE_URL;

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

  // solicitud al backend para inicio de sesión o registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
          setNotificationMessage('Nuevo usuario registrado correctamente.');
          setNotificationMessageType('success');

          // pasado un tiempo
          setTimeout(() => {
            // oculta la notificación
            setNotificationMessage('');

            // limpia los campos y redirige a login
            setFormData(initialFormData);
          }, 2000); 
        } else {
          if (data.msg?.includes('email')) {
            setNotificationMessage('El correo electrónico ya está en uso.');
          } else if (data.msg?.includes('nombre')) {
            setNotificationMessage('El nombre de usuario ya está en uso.');
          } else {
            setNotificationMessage('No se ha podido registrar.\nInténtalo más tarde.');
            console.error('Error en registro:', data.msg);
          }
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
            avatar: `${baseUrl}${data.user.avatar}`,
          });

          // muestra mensaje de confirmación
          setNotificationMessage('Se ha iniciado sesión correctamente.');
          setNotificationMessageType('success');

          // pasado un tiempo
          setTimeout(() => {
            // oculta la notificación
            setNotificationMessage('');

            // limpia los campos
            setFormData(initialFormData);

            // cierra el modal
            onClose();
          }, 2000);
        } else {
          setNotificationMessage(data.msg || 'No se pudo iniciar sesión.\nInténtalo más tarde.');
          setNotificationMessageType('error');

          if (data.msg?.includes('usuario' || 'email')) {
            setNotificationMessage('El nombre de usuario o email introducido no existe.');
          } else if (data.msg?.includes('contraseña')) {
            setNotificationMessage('La contraseña introducida no es correcta.');
          } else {
            setNotificationMessage('No se pudo iniciar sesión.\nInténtalo más tarde.');
            console.error('Error en inicio de sesión:', data.msg);
          }
          setNotificationMessageType('error');
          
          // oculta el mensaje pasado un tiempo
          setTimeout(() => {
            setNotificationMessage('');
          }, 2000);
        }
      } catch (error) {        
        setNotificationMessage('No se ha pudido conectar con el servidor.\nInténtalo más tarde.');
        setNotificationMessageType('error');

        // oculta el mensaje pasado un tiempo
        setTimeout(() => {
          setNotificationMessage('');
        }, 2000);

        console.error('Error de red:', error);
      }
    }
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
        <h2>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <input
                type="text"
                name="fullname"
                placeholder="Nombre y apellidos"
                value={fullname}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                value={username}
                onChange={handleInputChange}
                required
              />
              <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={handleInputChange}
              required
            />
            </>
          )}

          {!isRegistering && (
            <input
              type="text"
              name="credential"
              placeholder="Email o nombre de usuario"
              value={credential}
              onChange={handleInputChange}
              required
            />
          )}

          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Contraseña"
              value={password}
              onChange={handleInputChange}
              required
            />
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
