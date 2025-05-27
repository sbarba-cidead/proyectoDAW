import '../styles/Header.css';

import { Link } from 'react-router-dom';

import logo from '../assets/logo.png';
import LoginButton from './LoginButton';
import MenuButton from './MenuButton';


function Header({currentTitle}) {

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

