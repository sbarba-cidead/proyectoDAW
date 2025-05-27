import '../styles/MenuButton.css';

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa';

function MenuButton({ variant = "default" }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const menuRef = useRef();
    const location = useLocation();

    // cerrar el menú al hacer clic fuera
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

    // reinicia la visibiliad del tooltip al cambiar de ruta
    useEffect(() => {
        setShowTooltip(false);
    }, [location.pathname]);

    return (
        <div
            className={`links-button-container ${variant}`}
            ref={menuRef}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <FaBriefcase
                className="menu-icon"
                onClick={() => {
                    setMenuOpen(!menuOpen);
                    setShowTooltip(false);
                }}
            />

            {/* tooltip */}
            {showTooltip && !menuOpen && (
                <div className="tooltip">Menú</div>
            )}

            {menuOpen && (
                <div className="menu">
                    <Link 
                        to="/informacion-sostenibilidad" 
                        data-text="Información sobre Sostenibilidad"
                        onClick={() => {
                            setMenuOpen(false);
                            setShowTooltip(false);
                        }}
                    >
                        Información sobre Sostenibilidad
                    </Link>
                    <Link 
                        to="/herramientas" 
                        data-text="Herramientas de Sostenibilidad"
                        onClick={() => {
                            setMenuOpen(false);
                            setShowTooltip(false);
                        }}
                    >
                        Herramientas de Sostenibilidad
                    </Link>
                    <Link 
                        to="/foro" 
                        data-text="Foro Comunitario"
                        onClick={() => {
                            setMenuOpen(false);
                            setShowTooltip(false);
                        }}
                    >
                        Foro Comunitario
                    </Link>
                </div>
            )}
        </div>
    );
}

export default MenuButton;
