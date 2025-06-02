import 'styles/pages/MapPage.css';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistance } from 'geolib';
import { FaSearch, FaSquareFull, FaTimesCircle } from 'react-icons/fa';
import { useUserContext } from 'context/UserContext';
import { sendRecyclingActivity } from 'utils/functions';
import NotificationMessage from 'components/page-elements/NotificationMessage';
import userIcon from 'assets/marker-user-icon-red.png';

const mapMarkersUrl = process.env.REACT_APP_MAP_MARKERS_URL;

// creación de icono para los marcadores del mapa
const createIcon = (iconFilename) => L.icon({
    iconUrl: `${mapMarkersUrl}/${iconFilename}`,
    shadowUrl: `${mapMarkersUrl}/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// icono para el usuario
const redUserIcon = L.icon({
    iconUrl: userIcon,  // URL importada correcta
    shadowUrl: `${mapMarkersUrl}/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// manejo del movimiento de zoom del mapa 
// al cambiar coordenadas de foco
function MoveMap({ coords }) {
    const map = useMap();
  
    useEffect(() => {
      if (coords) {
        map.flyTo(coords, 14);
      }
    }, [coords, map]);
  
    return null;
}


function MapPage() {
    const { user, refreshUser } = useUserContext();
    const focusPoint = [38.6865475, -4.1108533] // coordenadas de Puertollano (punto por defecto)
    const [direction, setDirection] = useState('');
    const [result, setResult] = useState(null); // coordenadas de la dirección del usuario
    const [orderedPoints, setOrderedPoints] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null); // punto seleccionado en el mapa
    const markersRef = useRef([]); // referencia de los marcadores del mapa
    const [loading, setLoading] = useState(true);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationMessageType, setNotificationMessageType] = useState('');
    const [error, setError] = useState(null);
    const [isSmallWidthScreen, setIsSmallWidthScreen] = useState(window.innerWidth < 380);
    const [showSearchUI, setShowSearchUI] = useState(window.innerWidth < 380); // mostrar u ocultar input de búsqueda en móviles
    const resultMarkerRef = useRef(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    // solicita los puntos para el mapa al backend
    useEffect(() => {
        fetch(`${apiUrl}/recycle/recycle-points`)
            .then(res => res.json())
            .then(data => {
                setOrderedPoints(data);
                injectContainerColors(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error recuperando los puntos de reciclaje:', error);
                setError('No hay conexión con el servidor:\nNo se pudieron cargar los datos. Inténtalo de nuevo');
                setLoading(false);
            });
    }, [apiUrl]);

    // escucha a los cambios de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            const isSmallScreen = window.innerWidth < 380;
            setIsSmallWidthScreen(isSmallScreen);

            // para pantallas móviles se oculta el formulario de búsqueda
            // para mostrar un botón flotante en su lugar
            setShowSearchUI(!isSmallScreen);
        };
      
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // para mostrar mensaje de notificicación
    const showTempNotification = (msg, type, duration) => {
        setNotificationMessage(msg);
        setNotificationMessageType(type);
        setTimeout(() => setNotificationMessage(''), duration);
    };

    // función para guardar una nueva actividad de reciclaje
    const handleRecyclingActivity = async () =>{
        if (!user) { return; } // si no hay usuario iniciado no guarda la actividad

        try {
            await sendRecyclingActivity('Buscar puntos de reciclaje');
            await refreshUser(); // recarga los datos del usuario en contexto global
        } catch (error) {
            console.error('Error registrando actividad de reciclaje:', error.message);
        }
    }

    // muestra el popup con el texto buscado
    // sobre el marcador del mapa
    useEffect(() => {
    if (result) {
        const timeout = setTimeout(() => {
        if (resultMarkerRef.current) {
            resultMarkerRef.current.openPopup();
        }
        }, 500); // puedes ajustar el tiempo si hace falta

        return () => clearTimeout(timeout); // limpieza
    }
    }, [result]);

    const searchDirection = async () => {
        if (!direction) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direction)}`);
            const data = await res.json();

            if (data.length > 0) {
                const { lat, lon } = data[0];
                const coords = [parseFloat(lat), parseFloat(lon)];
                setResult(coords);

                const ordered = orderedPoints
                    .map(p => ({
                        ...p,
                        distance: getDistance(
                            { latitude: coords[0], longitude: coords[1] },
                            { latitude: p.coords[0], longitude: p.coords[1] }
                        )
                    }))
                    .sort((a, b) => a.distance - b.distance);

                    setOrderedPoints(ordered);

                    await handleRecyclingActivity();

                    if (isSmallWidthScreen) { // en pantallas móviles
                        setShowSearchUI(false); // oculta la barra de búsqueda tras buscar
                    }
            } else {
                setResult(null);
                showTempNotification('No se ha encontrado ninguna dirección con esos datos.', 'error', 3000);
            }
        } catch (error) {
            console.error(error);
            showTempNotification('Error al buscar la dirección.\nInténtalo de nuevo.', 'error', 3000);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        searchDirection();
    };

    // selección de puntos en el mapa
    const handlePointSelect = (point) => {
        setSelectedPoint(point);

        const marker = markersRef.current[point._id];
        
        if (marker) {
            marker.openPopup();
        }
    };

    const injectContainerColors = (points) => {
        if (document.getElementById('dynamic-container-colors')) return;

        const styleSheet = document.createElement("style");
        styleSheet.id = 'dynamic-container-colors';

        points.forEach(point => {
            const rule = `.icon-color-${point.containerType._id} { color: ${point.containerType.color}; }`;
            styleSheet.appendChild(document.createTextNode(rule));
        });

        document.head.appendChild(styleSheet);
    };    


    if (loading) return <div className="recyclemap-container loading">Recuperando datos...</div>;
    if (error) return <div className="recyclemap-container">
        {<NotificationMessage
            textMessage={error}
            notificationType={"error"} />
        }
    </div>;

    return (
        <div className="recyclemap-container">
            <div className="notification-message-wrapper">
                {notificationMessage && 
                    <NotificationMessage
                    textMessage={notificationMessage}
                    notificationType={notificationMessageType} />
                }
            </div>
            <div className="recycle-map">
                <MapContainer center={focusPoint} zoom={15} className="map">
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />

                    {(result && <MoveMap coords={result} />)}
                    {(selectedPoint && <MoveMap coords={selectedPoint.coords} />)}

                    {orderedPoints.map(p => {
                        const icon = createIcon(p.containerType.markerIcon);

                        return (
                            <Marker
                                key={p._id}
                                position={p.coords}
                                icon={icon}
                                eventHandlers={{ click: () => handlePointSelect(p) }}
                                ref={(el) => { markersRef.current[p._id] = el; }}
                            >
                                <Popup>{p.name}</Popup>
                            </Marker>
                        );
                    })}


                    {result && (
                        <Marker 
                            position={result} 
                            icon={redUserIcon}
                            ref={resultMarkerRef}
                        >
                            <Popup>Ubicación buscada</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
            
            <div className={`recycle-sidebar ${isSmallWidthScreen ? (showSearchUI ? 'small-height' : 'large-height') : ''}`}>
                {/* se oculta para pantallas pequeñas cuando showSearchUI es false */}
                {(!isSmallWidthScreen || showSearchUI) && (
                    <form onSubmit={handleSubmit} className="recycle-form">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={direction}
                                onChange={(e) => setDirection(e.target.value)}
                                placeholder="Introduce una dirección"
                            />
                            { direction && (<FaTimesCircle  className="clear-icon"
                                onClick={() => setDirection('')} />)
                            }
                        </div>
                        <button type="submit">Buscar</button>
                    </form>
                )}
                
                {/* se muestra si es pantalla grande */}
                {/* si es pantalla pequeña, sólo se muestra si showSearchUI es false */}
                {(!isSmallWidthScreen || !showSearchUI) && (
                    <>
                        <h3>Puntos cercanos</h3>
                        <ul className="recycle-list">
                            {orderedPoints.map(p => (
                                <li key={p._id} onClick={() => handlePointSelect(p)}>
                                    <FaSquareFull className={`color-indicator icon-color-${p.containerType?._id}`} />
                                    {p.name} {p.distance ? `- ${(p.distance / 1000).toFixed(2)} km` : ''}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            {isSmallWidthScreen && !showSearchUI && (
                <button className="floating-search-button" onClick={() => setShowSearchUI(true)}>
                    <FaSearch />
                </button>
            )}
        </div>
    );

} export default MapPage;
