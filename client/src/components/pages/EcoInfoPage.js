import 'styles/pages/EcoInfoPage.css';

import { useEffect, useState } from 'react';
import { useUserContext } from 'context/UserContext';
import { sendRecyclingActivity } from 'utils/functions';
import NotificationMessage from 'components/page-elements/NotificationMessage';


function EcoInfoPage() {
    const { user } = useUserContext();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;
    const baseUrl = process.env.REACT_APP_BASE_URL;
    

    // función para guardar una nueva actividad de reciclaje
    const handleRecyclingActivity = async (link) =>{
        if (!user) { // si no hay usuario iniciado
            window.open(link, '_blank'); // se abre la ventana del link
            return; // si no hay usuario iniciado no guarda la actividad
        }

        try {
            await sendRecyclingActivity('Informarse sobre Sostenibilidad');
        } catch (error) {
            console.error('Error registrando actividad de reciclaje:', error.message);
        } finally {
            window.open(link, '_blank'); // se abre la ventana del link
        }
    }    

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
                setError('No hay conexión con el servidor:\nNo se pudieron cargar los datos. Inténtalo de nuevo');
                setLoading(false);
            });
    }, [apiUrl]);


    if (loading) return <div className="ecoinfo-main-container loading">Recuperando datos...</div>;
    if (error) return <div className="ecoinfo-main-container">
        {<NotificationMessage
            textMessage={error}
            notificationType={"error"} />
        }
    </div>;

    return (
        <div className="ecoinfo-main-container">
            <div className="ecoinfo-grid">
                {cards.map((card, index) => (
                    <a
                        className="ecoinfo-card-link"
                        href={card.link}
                        target="_blank" // se abre en nueva pestaña
                        rel="noopener noreferrer"
                        key={index}
                        onClick={(e) => {
                            e.preventDefault();
                            handleRecyclingActivity(card.link);
                        }}
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
