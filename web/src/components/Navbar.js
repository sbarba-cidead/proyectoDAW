import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-links-left">
        <Link to="#home" id="home-button">Inicio</Link>
      </div>

      <img src={logo} id="logo" alt="Logo de la web" />

      <div className="nav-links-right">
        <Link to="#" id="login-button">Iniciar sesión</Link>
      </div>
    </nav>
  );
}

export default Navbar;

