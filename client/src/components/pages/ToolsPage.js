import 'styles/pages/ToolsPage.css';

import { Link } from 'react-router-dom';
import recyclingMapImg from 'assets/recycling-map.webp';
import ecoCalcImg from 'assets/ecocalc.webp';
import recyclingGuideImg from 'assets/recycling-guide.webp';

// diseño flexible por si se quieren añadir más herramientas en un futuro
const tools = [
  {
    title: 'Zonas de Reciclaje',
    description: 'Encuentra los puntos de reciclaje cercanos.',
    linkText: 'Ver Mapa',
    href: '/mapa-reciclaje',
    imgSrc: recyclingMapImg,
    imgAlt: 'Zonas de reciclaje',
  },
  {
    title: 'Calculadora de Huella de Carbono',
    description: 'Calcula tu impacto ambiental.',
    linkText: 'Calcula ahora',
    href: '/calculadora-huella-ecologica',
    imgSrc: ecoCalcImg,
    imgAlt: 'Calculadora Huella',
  },
  {
    title: 'Reciclaje de Residuos',
    description: '¿Dónde desechar cada residuo?',
    linkText: 'Consulta aquí',
    href: '/contenedores-reciclaje',
    imgSrc: recyclingGuideImg,
    imgAlt: 'Residuos',
  },
];


function ToolsPage() {

  return (
    <div className="tools-container">
      {tools.map((tool, index) => (
        <Link
          key={index}
          to={tool.href}
          className="tool-card"
        >
          <div className="tool-img-container">
            <img 
              src={tool.imgSrc} 
              alt={tool.imgAlt}
            />
          </div>
          <div className="tool-title"><h3>{tool.title}</h3></div>
          <div className="tool-text"><p>{tool.description}</p></div>
          <div className="tool-link-text">{tool.linkText}</div>
        </Link>
      ))}
    </div>
  );
}

export default ToolsPage;
