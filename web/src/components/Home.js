import '../styles/Home.css';

import { Link } from 'react-router-dom';

import logo from '../assets/logo.png';

function Home() {
    return (
        <div className="home">
            <div className="head-container">
                <div className="tools-button-container">
                    <Link to="#" id="tools-button">Herramientas de Sostenibilidad</Link>
                </div>
            
                <img src={logo} id="logo" alt="Logo de la web" />
            
                <div className="login-button-container">
                    <Link to="#" id="login-button">Iniciar sesión</Link>
                </div>
            </div>

            <div className="main-container">
                <div className="main-content">
                    <h1>Bienvenidos a <br/> Puertollano Sostenible</h1>
                    <p>Juntos podemos hacer de nuestra ciudad un lugar mejor.</p>
                    <button>Descubre cómo</button>
                </div>
            </div>
        </div>
    );
}

export default Home;