import React from 'react';
import '../styles/EcoInfo.css';

import Image1 from '../assets/sostenibilidad.png';
import Image2 from '../assets/ods.png';
import Image3 from '../assets/agenda2030.png';
import Image4 from '../assets/clm.png';

const cards = [
    {
        image: Image1,
        alt: 'Sostenibilidad',
        title: '¿Qué es la sostenibilidad?',
        text: 'La sostenibilidad busca equilibrar nuestras necesidades actuales sin comprometer las de las futuras generaciones.',
        link: 'https://www.un.org/esa/sustdev/documents/agenda21/english/agenda21toc.htm',
        linkText: 'Más información sobre el Informe Brundtland',
    },
    {
        image: Image2,
        alt: 'ODS',
        title: 'ODM y ODS',
        text: 'Los ODM fueron 8 metas globales. Los ODS son 17 objetivos universales para lograr un desarrollo sostenible.',
        link: 'https://www.un.org/sustainabledevelopment/es/',
        linkText: 'Descubre los 17 Objetivos de Desarrollo Sostenible',
    },
    {
        image: Image3,
        alt: 'Agenda 2030',
        title: 'Agenda 2030',
        text: 'Plan global para lograr un desarrollo sostenible económico, social y ambiental.',
        link: 'https://www.un.org/sustainabledevelopment/es/agenda2030/',
        linkText: 'Conoce más sobre la Agenda 2030',
    },
    {
        image: Image4,
        alt: 'Castilla-La Mancha',
        title: 'Normativas en Castilla-La Mancha',
        text: 'Castilla-La Mancha promueve la sostenibilidad mediante leyes como la de Economía Circular y Cambio Climático.',
        link: 'https://www.castillalamancha.es/gobierno/desarrollosostenible',
        linkText: 'Toda la información sobre Desarrollo Sostenible en CLM',
    },
];

function EcoInfo() {
    return (
        <div className="ecoinfo-main-container">
            <div className="ecoinfo-grid">
                {/* Primera fila: Imágenes */}
                <div className="ecoinfo-row">
                    {cards.map((card, index) => (
                        <div className="ecoinfo-cell" key={index}>
                            <img className="ecoinfo-image" src={card.image} alt={card.alt} />
                        </div>
                    ))}
                </div>

                {/* Segunda fila: Títulos */}
                <div className="ecoinfo-row">
                    {cards.map((card, index) => (
                        <div className="ecoinfo-cell" key={index}>
                            <h2 className="ecoinfo-title">{card.title}</h2>
                        </div>
                    ))}
                </div>

                {/* Tercera fila: Textos */}
                <div className="ecoinfo-row">
                    {cards.map((card, index) => (
                        <div className="ecoinfo-cell" key={index}>
                            <p className="ecoinfo-text">{card.text}</p>
                        </div>
                    ))}
                </div>

                {/* Cuarta fila: Links */}
                <div className="ecoinfo-row">
                    {cards.map((card, index) => (
                        <div className="ecoinfo-cell" key={index}>
                            <a className="ecoinfo-link" href={card.link} target="_blank" rel="noopener noreferrer">
                                {card.linkText}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default EcoInfo;
