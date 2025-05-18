import '../../styles/MapPage.css';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistance } from 'geolib';
import { FaSquareFull, FaTimesCircle } from 'react-icons/fa';

// contenedor amarillo (plástico)
const yellowIcon = L.icon({
    iconUrl: '/marker-icon-yellow.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// contenedor azul (papel)
const blueIcon = L.icon({
    iconUrl: '/marker-icon-blue.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
  
// contenedor verde (vídrio)
const darkgreenIcon = L.icon({
    iconUrl: '/marker-icon-dark-green.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// contenedor marrón (orgánico)
const orangeIcon = L.icon({
    iconUrl: '/marker-icon-orange.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// contenedor gris (no reciclable)
const greyIcon = L.icon({
    iconUrl: '/marker-icon-grey.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// dirección usuario
const redUSerIcon = L.icon({
    iconUrl: '/marker-user-icon-red.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// punto SIGRE
const violetIcon = L.icon({
    iconUrl: '/marker-icon-violet.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// punto pilas
const blackIcon = L.icon({
    iconUrl: '/marker-icon-black.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// punto ropa
const pinkIcon = L.icon({
    iconUrl: '/marker-icon-pink.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// punto limpio
const greenIcon = L.icon({
    iconUrl: '/marker-icon-green.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// color por defecto para otros puntos
const whiteIcon = L.icon({
    iconUrl: '/marker-icon-white.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const recyclePoints = [
  { id: 1, name: "Contenedor Azul", coords: [38.687509, -4.106194], type: "azul" },
  { id: 2, name: "Contenedor Amarillo", coords: [38.688577, -4.107017], type: "amarillo" },
  { id: 3, name: "Contenedor Verde", coords: [38.691246, -4.108323], type: "verde" },
  { id: 4, name: "Contenedor Gris", coords: [38.689496, -4.112148], type: "gris" },
  { id: 5, name: "Contenedor Marrón", coords: [38.686456, -4.111537], type: "marron" },
  { id: 6, name: "Contenedor Pilas", coords: [38.685250, -4.105217], type: "pilas" },
  { id: 7, name: "Contenedor SIGRE", coords: [38.686289, -4.104456], type: "sigre" },
  { id: 8, name: "Contenedor Ropa", coords: [38.687478, -4.098963], type: "ropa" },
  { id: 9, name: "Punto Limpio", coords: [38.665064, -4.112298], type: "punto-limpio" },
  { id: 10, name: "Contenedor Azul", coords: [38.68340, -4.09756], type: "azul" },
  { id: 11, name: "Contenedor Amarillo", coords: [38.68224, -4.08458], type: "amarillo" },
  { id: 12, name: "Contenedor Verde", coords: [38.68342, -4.09000], type: "verde" },
  { id: 13, name: "Contenedor Gris", coords: [38.68193, -4.10824], type: "gris" },
  { id: 14, name: "Contenedor Marrón", coords: [38.68425, -4.11736], type: "marron" },
  { id: 15, name: "Contenedor Pilas", coords: [38.691121, -4.109477], type: "pilas" },
  { id: 16, name: "Contenedor SIGRE", coords: [38.697778, -4.107760], type: "sigre" },
  { id: 17, name: "Contenedor Ropa", coords: [38.684932, -4.115410], type: "ropa" },
];

function MoveMap({ coords }) {
    const map = useMap();
  
    useEffect(() => {
      if (coords) {
        map.flyTo(coords, 14);
      }
    }, [coords, map]);
  
    return null;
}

function RecycleMap() {
    const focusPoint = [38.6865475, -4.1108533] // coordenadas de Puertollano
    const [direction, setDirection] = useState('');
    const [result, setResult] = useState(null); // coordenadas de la dirección del usuario
    const [orderedPoints, setOrderedPoints] = useState(recyclePoints);
    const [selectedPoint, setSelectedPoint] = useState(null); // punto seleccionado en el mapa
    const markersRef = useRef([]); // referencia de los marcadores del mapa
    const [error, setError] = useState(''); // mensaje de error en búsqueda de dirección
    const [isSmallWidthScreen, setIsSmallWidthScreen] = useState(window.innerWidth < 368);

    // escucha a los cambios de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            setIsSmallWidthScreen(window.innerWidth < 368);
        };
      
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const searchDirection = async () => {
        if (!direction) return;

        setError(''); // limpia errores anteriores

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
            } else {
                setResult(null);
                setError('No se ha encontrado ninguna dirección con esos datos.');
            }
        } catch (err) {
            console.error(err);
            setError('Error al buscar la dirección.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        searchDirection();
    };

    const handlePointSelect = (point) => {
        setSelectedPoint(point);

        const marker = markersRef.current[point.id];
        
        if (marker) {
            marker.openPopup();
        }
    };

    // mapeo de contenedores con iconos de marcador
    const iconMap = {
        'amarillo': yellowIcon,
        'azul': blueIcon,
        'verde': darkgreenIcon,
        'marron': orangeIcon,
        'gris': greyIcon,
        'sigre': violetIcon,
        'pilas': blackIcon,
        'ropa': pinkIcon,
        'punto-limpio': greenIcon,
    };

    return (
        <div className="recyclemap-container">
            <div className="recycle-map">
                <MapContainer center={focusPoint} zoom={15} className="map">
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />

                    {(result && <MoveMap coords={result} />)}
                    {(selectedPoint && <MoveMap coords={selectedPoint.coords} />)}

                    {orderedPoints.map(p => (
                        <Marker key={p.id} position={p.coords} icon={iconMap[p.type] || whiteIcon}
                                eventHandlers={{ click: () => handlePointSelect(p) }}
                                ref={(el) => { markersRef.current[p.id] = el; }}>
                            <Popup>{p.name}</Popup>
                        </Marker>
                    ))}

                    {result && (
                        <Marker position={result} icon={redUSerIcon}>
                            <Popup>Ubicación buscada</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            <div className="recycle-sidebar">
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

                {error && <div className="error-message">{error}</div>}
                
                {(!error || !isSmallWidthScreen) && (
                    <>
                        <h3>Puntos cercanos</h3>
                        <ul className="recycle-list">
                            {orderedPoints.map(p => (
                                <li key={p.id} onClick={() => handlePointSelect(p)}>
                                    <FaSquareFull className={`color-indicator tint-contenedor-${p.type}`} />
                                    {p.name} {p.distance ? `- ${(p.distance / 1000).toFixed(2)} km` : ''}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );

} export default RecycleMap;
