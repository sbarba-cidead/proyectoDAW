import '../styles/LoginButton.css';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import LoginModal from './LoginModal';

function LoginButton() {
    const [showLogin, setShowLogin] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const navigate = useNavigate();

    // Simulamos que obtenemos el usuario del estado global o contexto
    const user = null; // Cambia esto con la lógica real de usuario

    // función para manejar el click en el botón
    const handleClick = () => {
        if (user) { // si hay un usuario con sesión iniciada
            // redirige a la página de perfil de usuario
            navigate('/perfil-usuario');
        } else { // si no hay usuario con sesión iniciada
            // muestra el modal de login
            setShowLogin(true);
        }
    };

    return (
        <div className="login-button-container">
            <button
                className="login-button"
                onClick={handleClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {/* Si hay usuario, muestra su foto; si no, muestra avatar invitado */}            
                {user ? (
                    <img src={user.photoURL} alt="Avatar" className="avatar logged-in" />
                ) : (
                    <FaUserCircle className="guest-avatar" />
                )}
            </button>

            {/* Tooltip */}
            {showTooltip && (
                <div className="tooltip">
                    {user ? user.displayName : 'Modo invitado'}
                </div>)}

            {/* modal de login si no hay usuario con sesión iniciada */}
            {!user && showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </div>
    );
}

export default LoginButton;
