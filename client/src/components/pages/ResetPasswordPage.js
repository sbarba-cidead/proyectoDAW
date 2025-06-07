import 'styles/pages/ResetPasswordPage.css';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import NotificationMessage from 'components/page-elements/NotificationMessage';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationMessageType, setNotificationMessageType] = useState('');
  const [token, setToken] = useState(null);
  const [tokenOK, setTokenOK] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    setLoading(true);

    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');         

    // validación del token recibido
    async function validateToken() {
      try {
        const response = await fetch(`${apiUrl}/auth//validate-password-token/${tokenFromUrl}`);
        const data = await response.json();

        if (!data.valid) {
          showTempNotification(
            'El token recibido es inválido o ha expirado.\nSerás redirigido a la página de inicio.',
            'error',
            5000
          );

          setTimeout(() => navigate('/'), 5000);

          return;
        }

        // guarda el token de la url
        setToken(tokenFromUrl);
        setTokenOK(true);

        // limpia el token de la url
        window.history.replaceState({}, document.title, '/recuperar-contrasena');
      } catch (error) {
        showTempNotification(
          'Error en la validación del token. Inténtalo de nuevo.\nSerás redirigido a la página de inicio.',
          'error',
          5000
        );

        setTimeout(() => navigate('/'), 5000);

        console.error("Error en la validación del token", error);
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [location.search, navigate]);

  // maneja e botón de submit del formulario de creación de nueva contraseña
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      showTempNotification(
        'Todos los campos son obligatorios.',
        'error',
        2000
      );

      return;
    }

    if (password !== confirmPassword) {
      showTempNotification(
        'Las contraseñas no coinciden.',
        'error',
        2000
      );

      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        showTempNotification(
          'Tu contraseña ha sido restablecida correctamente.',
          'success',
          3000
        );

        setTimeout(() => navigate('/'), 3000);
      } else {
        if (data.error === 'INVALID_OR_EXPIRED_TOKEN') {
          showTempNotification(
            'El token ha expirado.\nSolicita uno nuevo.',
            'error',
            2000
          );
        } else {
          showTempNotification(
            'Hubo un error al restablecer la contraseña.\nInténtalo de nuevo.',
            'error',
            3000
          );

          console.error('Error restableciendo la contraseña', data.error);  
        }
      }
    } catch (error) {
      showTempNotification(
        'Error de red. Inténtalo de nuevo más tarde.',
        'error',
        3000
      );

      console.error('Error de conexión con el servidor', error); 
    }
  };

  // para mostrar mensaje de notificicación
  const showTempNotification = (msg, type, duration) => {
    setNotificationMessage(msg);
    setNotificationMessageType(type);
    setTimeout(() => setNotificationMessage(''), duration);
  };

  if (loading) return <div className="reset-password-background">Validando token...</div>;

  return (
    <div className="reset-password-background">
      {notificationMessage && 
        <NotificationMessage
          textMessage={notificationMessage}
          notificationType={notificationMessageType} />
      }
      {tokenOK && (
        <div className="reset-password-container">
          <h2>Restablecer contraseña</h2>
          <form onSubmit={handleSubmit}>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button type="submit">Restablecer contraseña</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ResetPasswordPage;