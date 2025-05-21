import '../styles/TutorialModal.css';

import { useState } from 'react';
import { FaChartBar, FaCommentDots, FaGlobeEurope, FaGrinTongue, FaLock, FaPaperPlane, FaProjectDiagram, FaTools, FaTrophy } from 'react-icons/fa';

const TutorialModal = ({ onClose }) => {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else onClose(); // Finaliza el tutorial
  };

  return (
    <div className="tutorial-overlay">
      {step === 1 && (
        <div className="tutorial-box top-left">
          <div className="arrow arrow-left" />
          <div className="content">
            <h2>Explora</h2>
            <p>Desde el menú puedes acceder a:</p>
            <ul>
              <li><FaPaperPlane /> Información sobre Sostenibilidad</li>
              <li><FaTools /> Herramientas útiles</li>
              <li><FaCommentDots /> Foro comunitario</li>
            </ul>
            <button onClick={nextStep}>Siguiente</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="tutorial-box top-right">
          <div className="arrow arrow-right" />
          <div className="content">
            <h2>Tu cuenta</h2>
            <p>Aquí puedes crear tu cuenta, iniciar sesión o ver tu perfil.</p>
            <p>Aunque puedes usar la web como invitado, una cuenta te permite:</p>
            <ul>
              <li><FaLock /> Participar en los foros</li>
              <li><FaChartBar /> Guardar tu progreso</li>
              <li><FaTrophy /> Ganar puntos y logros</li>
            </ul>
            <p className="centered purple bold">¡Anímate! <FaGrinTongue /></p>
            <button onClick={nextStep}>Siguiente</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="tutorial-box center">
          <div className="content">
            <h2>¡Listos para comenzar!</h2>
            <p className="centered blue">Explora, participa y mejora tu ciudad con <span className='bold'>Puertollano Sostenible</span> <FaGlobeEurope /></p>
            <button className="centered" onClick={onClose}>¡Empezamos!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialModal;
