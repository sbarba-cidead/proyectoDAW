import '../styles/LoginButton.css';

import { useState, useRef, useEffect } from 'react';
import { useUserContext } from '../context/UserContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import LoginModal from './LoginModal';

function LoginButton() {
    const { user, isLoadingUser, setUserGlobalContext } = useUserContext();
    const [showLogin, setShowLogin] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef();

    // estado inicial de las variables para 
    // guardado temporal de los datos del formulario de login/registro
    const initialFormData = {
        fullname: '',
        username: '',
        email: '',
        credential: '',
        password: '',
        isRegistering: false,
    };

    // estado para almacenar temporalmente los valores del formulario
    const [formData, setFormData] = useState(initialFormData);

    // maneja el click en el botón
    const handleClick = () => {
        if (user) { // si hay un usuario con sesión iniciada
            // abre un menú
            setShowMenu(prev => !prev);
        } else { // si no hay usuario con sesión iniciada
            // muestra el modal de login
            setShowLogin(true);
        }
    };

    // logout del usuario en el menú
    const handleLogout = () => {
        localStorage.removeItem('usertoken');
        setUserGlobalContext(null);
        setShowMenu(false);

        if (location.pathname === '/perfil-usuario') {
            navigate('/');
        }        
    };

    // cierra el menú de usuario al pulsar fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false); // cierra el menú
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        // limpia el eventlistener cuando se oculta el menú
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // guarda los valores del formulario de forma temporal
    // mientras no se recargue la página
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
   

    if (isLoadingUser) return null;
   
    return (
        <div className="login-button-container" ref={menuRef}>
            <button
                className="login-button"
                onClick={handleClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {/* Si hay usuario, muestra su foto; si no, muestra avatar invitado */}            
                {user ? (
                    <img src={`${user.avatar}?${Date.now()}`} alt="Avatar" className="avatar logged-in" />
                ) : (
                    <FaUserCircle className="guest-avatar" />
                )}
            </button>

            {/* tooltip con el nombre de usuario */}
            {showTooltip && !showMenu && (
                <div className="tooltip">
                    {user ? user.username : 'Modo invitado'}
                </div>)}

            {/* modal de login si no hay usuario con sesión iniciada */}
            {!user && showLogin && 
                <LoginModal 
                    initialFormData={initialFormData}
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    onClose={() => setShowLogin(false)} />}

            {/* menú de usuario si hay usuario con sesión iniciada */}
            {user && showMenu && (
                <div className="menu">
                    <Link to="/perfil-usuario" onClick={() => setShowMenu(false)} data-text="Perfil">Perfil usuario</Link>
                    <Link onClick={handleLogout} data-text="Cerrar sesión">Cerrar sesión</Link>
                </div>
            )}
        </div>
    );
}

export default LoginButton;
