import '../styles/Header.css';

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { WEBSITE_NAME } from '../config/constants';
import logo from '../assets/logo.png';
import LoginButton from './LoginButton';


function Header() {
  const location = useLocation(); // localización de ruta url en la web

  const pageTitles = {
    "/perfil-usuario": "Datos de usuario",
    "/herramientas": "Herramientas de Sostenibilidad",
    "/calculadora-huella-ecologica": "Calculadora de Huella Ecológica",
    "/mapa-reciclaje": "Mapa de Reciclaje",
    "/contenedores-reciclaje": "Contenedores de Reciclaje",
    "/foro": "Comunidad de Sostenibilidad",
    "/informacion-sostenibilidad": "Información sobre Sostenibilidad",
  };

  const currentTitle = pageTitles[location.pathname] || "";

  // actualiza el título en la pestaña del navegador
  useEffect(() => {
    if (currentTitle) {
      document.title = `${currentTitle} - ${WEBSITE_NAME}`;
    } else {
      document.title = WEBSITE_NAME;
    }
  }, [currentTitle]);

  return (
    <nav className="navbar">
      <div className="nav-links-left">
        <Link to="#home" id="home-button">Inicio</Link>
      </div>

      <div className="navbar-center">
        <img src={logo} id="logo" alt="Logo de la web" />
        {currentTitle && <h1 className="page-title">{currentTitle}</h1>}
      </div>

      <div className="nav-links-right">
        <LoginButton className="login-button" />
      </div>
    </nav>
  );
}

export default Header;

