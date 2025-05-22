import '../styles/MenuButton.css';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa';

function MenuButton({ variant = "default" }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
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
                    <Link to="/informacion-sostenibilidad" data-text="Información sobre Sostenibilidad">Información sobre Sostenibilidad</Link>
                    <Link to="/herramientas" data-text="Herramientas de Sostenibilidad">Herramientas de Sostenibilidad</Link>
                    <Link to="/foro" data-text="Foro Comunitario">Foro Comunitario</Link>
                </div>
            )}
        </div>
    );
}

export default MenuButton;
