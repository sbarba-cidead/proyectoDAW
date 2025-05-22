import '../../styles/HomePage.css';

import { useState } from 'react';

import logo from '../../assets/logo.png';
import LoginButton from '../LoginButton';
import TutorialModal from '../TutorialModal';
import MenuButton from '../MenuButton';

function HomePage() {
    const [showTutorial, setShowTutorial] = useState(false);

    return (
        <div className="home-main-container">
            <div className="head-container">
                <MenuButton variant="home"/>

                <div className="login-container">
                    <LoginButton />
                </div>
            </div>

            <div className="main-container">
                <img src={logo} id="logo" alt="Logo de la web" />
                <div className="main-content">
                    <h1>Bienvenidos a <br/> Puertollano Sostenible</h1>
                    <p>Juntos podemos hacer de nuestra ciudad un lugar mejor.</p>
                    <button onClick={() => setShowTutorial(true)}>Descubre cómo</button>
                </div>
            </div>

            {/* modal con tutorial de inicio */}
            {showTutorial && (
                <TutorialModal onClose={() => setShowTutorial(false)} />
            )}
        </div>
    );
}

export default HomePage;
