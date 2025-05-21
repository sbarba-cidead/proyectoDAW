import '../../styles/HomePage.css';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa';

import logo from '../../assets/logo.png';
import LoginButton from '../LoginButton';
import TutorialModal from '../TutorialModal';

function HomePage() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();

    // Cerrar el menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="home-main-container">
            <div className="head-container">
                <div className="links-button-container" ref={menuRef}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <FaBriefcase className="menu-icon" onClick={() => { setMenuOpen(!menuOpen); setShowTooltip(false)}} />

                    {/* tooltip */}
                    {showTooltip && !menuOpen && (<div className="tooltip">Menú</div>)}
                            
                    {menuOpen && (
                        <div className="menu">
                            <Link to="/informacion-sostenibilidad" data-text="Información sobre Sostenibilidad">Información sobre Sostenibilidad</Link>
                            <Link to="/herramientas" data-text="Herramientas de Sostenibilidad">Herramientas de Sostenibilidad</Link>
                            <Link to="/foro" data-text="Foro Comunitario">Foro Comunitario</Link>
                        </div>
                    )}
                </div>

                <div className="login-container">
                    <LoginButton />
                </div>
            </div>

            <div className="main-container">
                <img src={logo} id="logo" alt="Logo de la web" />
                <div className="main-content">
                    <h1>Bienvenidos a <br/> Puertollano Sostenible</h1>
                    <p>Juntos podemos hacer de nuestra ciudad un lugar mejor.</p>
                    <button onClick={() => setShowTutorial(true)}>Descubre cómo</button>
                </div>
            </div>

            {/* modal con tutorial de inicio */}
            {showTutorial && (
                <TutorialModal onClose={() => setShowTutorial(false)} />
            )}
        </div>
    );
}

export default HomePage;
