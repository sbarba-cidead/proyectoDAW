import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function ResetPasswordPage() {
const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const token = queryParams.get('token');
//   const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return setMessage('Todos los campos son obligatorios.');
    }

    if (password !== confirmPassword) {
      return setMessage('Las contraseñas no coinciden.');
    }

    try {
      const response = await fetch(`${apiUrl}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Tu contraseña ha sido restablecida correctamente.');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setMessage(data.msg || 'Hubo un error al restablecer la contraseña.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error de red. Intenta más tarde.');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Restablecer contraseña</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Restablecer contraseña</button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;