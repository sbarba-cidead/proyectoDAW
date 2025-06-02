import 'styles/page-elements/MenuButton.css';

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa';

function MenuButton({ variant = "default" }) {
    const [isSmallWidthScreen, setIsSmallWidthScreen] = useState(window.innerWidth < 380);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const menuRef = useRef();
    const lastRouteChangeTimeRef = useRef(0);
    const location = useLocation();


    // escucha a cambios de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            setIsSmallWidthScreen(window.innerWidth < 380);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        lastRouteChangeTimeRef.current = Date.now();
        setShowTooltip(false);
    }, [location.pathname]);

    // reinicia la visibiliad del tooltip al cerrar menú
    useEffect(() => {
        if (!menuOpen) {
            const timer = setTimeout(() => {
                const timeSinceRouteChange = Date.now() - lastRouteChangeTimeRef.current;
                if (timeSinceRouteChange > 300 && menuRef.current?.matches(':hover')) {
                    setShowTooltip(true);
                }
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [menuOpen]);

    return (
        <div
            className={`links-button-container ${variant}`}
            ref={menuRef}
            onMouseEnter={() => {
                if (!isSmallWidthScreen) setShowTooltip(true);
            }}
            onMouseLeave={() => {
                if (!isSmallWidthScreen) setShowTooltip(false);
            }}
        >
            <button
                className="menu-button"
                onClick={() => { setMenuOpen(!menuOpen); }}
            >
                <FaBriefcase className="menu-icon" onClick={() => { setMenuOpen(!menuOpen); }}  />
            </button>

            {/* tooltip */}
            {showTooltip && !menuOpen && !isSmallWidthScreen && (
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
