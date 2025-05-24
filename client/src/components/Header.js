import '../styles/Header.css';

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { WEBSITE_NAME } from '../config/constants';
import logo from '../assets/logo.png';
import LoginButton from './LoginButton';
import MenuButton from './MenuButton';


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
  
  // calcula el título basado en la ruta que se está visitando
  const currentTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  )?.[1] || "";

  // actualiza el título para la cabecera y la pestaña del navegador
  useEffect(() => {
    document.title = currentTitle ? `${currentTitle} - ${WEBSITE_NAME}` : WEBSITE_NAME;
  }, [currentTitle]);

  return (
    <nav className="header-main-container">
      <div className="upper-container">
        <div className="left-container">
          <MenuButton variant="header"/>
        </div>

        <div className="center-container">
          <Link to="/"><img src={logo} className="logo" alt="Logo de la web" /></Link>                    
        </div>

        <div className="right-container">
          <LoginButton className="login-button" />
        </div>
      </div>
      <div className="bottom-container">
        {currentTitle && <h1 className="page-title">{currentTitle}</h1>}
      </div>
    </nav>
  );
}

export default Header;

