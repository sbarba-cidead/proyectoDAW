import '../../styles/EcoInfoPage.css';

import { useEffect, useState } from 'react';

function EcoInfoPage() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;
    const baseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetch(`${apiUrl}/recycle/eco-info-cards`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Error al obtener los datos');
                }
                return res.json();
            })
            .then((data) => {
                setCards(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error cargando tarjetas:', err);
                setError('No se pudieron cargar las tarjetas');
                setLoading(false);
            });
    }, [apiUrl]);

    if (loading) return <div className="ecoinfo-main-container"></div>;
    if (error) return <div className="ecoinfo-main-container">{error}</div>;

    return (
        <div className="ecoinfo-main-container">
            <div className="ecoinfo-grid">
                {cards.map((card, index) => (
                    <a
                        className="ecoinfo-card-link"
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}
                    >
                        <article className="ecoinfo-card" tabIndex={0}>
                            <div className="ecoinfo-image-container">
                                <img className="ecoinfo-image" src={`${baseUrl}${card.image}`} alt={card.alt} />
                            </div>
                            <h2 className="ecoinfo-title">{card.title}</h2>
                            <p className="ecoinfo-text">{card.text}</p>
                            <div className="ecoinfo-link-text">{card.linkText}</div>
                        </article>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default EcoInfoPage;
