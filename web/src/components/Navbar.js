import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/Navbar.css';


function Navbar() {

  const location = useLocation();

  const pageTitles = {
    "/perfil-usuario": "Datos de usuario",
    "/herramientas": "Herramientas de Sostenibilidad",
    "/calculadora-huella-ecologica": "Calculadora de Huella Ecológica",
    "/mapa-reciclaje": "Mapa de Reciclaje",
    "/contenedores-reciclaje": "Contenedores de Reciclaje",
    "/foro": "Comunidad de Sostenibilidad",
    "/informacion-sostenibilidad": "Información de Sostenibilidad",
  };

  const currentTitle = pageTitles[location.pathname] || "";

  return (
    <nav className="navbar">
      <div className="nav-links-left">
        <Link to="#home" id="home-button">Inicio</Link>
      </div>

      {/* <img src={logo} id="logo" alt="Logo de la web" /> */}

      <div className="navbar-center">
        <img src={logo} id="logo" alt="Logo de la web" />
        {currentTitle && <h1 className="page-title">{currentTitle}</h1>}
      </div>

      <div className="nav-links-right">
        <Link to="#" id="login-button">Iniciar sesión</Link>
      </div>
    </nav>
  );
}

export default Navbar;

