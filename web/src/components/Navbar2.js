// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import '../styles/Navbar2.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/" className="navbar-link">Inicio</Link>
        </li>
        <li className="navbar-item">
          <Link to="/second-page" className="navbar-link">Segunda Página</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
