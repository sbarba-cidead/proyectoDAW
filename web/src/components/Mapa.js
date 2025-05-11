import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const Mapa = () => {
  const mapRef = useRef(null); // Referencia al contenedor del mapa
  const mapInstanceRef = useRef(null); // Guardar la instancia del mapa

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [40.3170602428245, -3.4769062521164154],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([40.3170602428245, -3.4769062521164154])
        .addTo(map)
        .bindPopup("Este es el marcador en Madrid.")
        .openPopup();

      map.invalidateSize();

      // Guardar la instancia
      mapInstanceRef.current = map;
    }

    return () => {
      // Eliminar la instancia del mapa si existe
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div
        id="map-container"
        ref={mapRef}
        style={{ height: "500px", width: "100%", border: "2px solid red" }}
      ></div>
    </div>
  );
};

//   useEffect(() => {
//     // Asegúrate de que el contenedor del mapa esté cargado
//     const mapContainer = mapRef.current;

//     if (mapContainer) {
//       // Crear el mapa en el contenedor de referencia
//       const map = L.map(mapContainer, {
//         center: [40.3170602428245, -3.4769062521164154], // Coordenadas de Madrid
//         zoom: 13,
//       });

//       // Agregar una capa de OpenStreetMap
//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       // Agregar un marcador
//       L.marker([40.3170602428245, -3.4769062521164154])
//         .addTo(map)
//         .bindPopup("Este es el marcador en Madrid.")
//         .openPopup();

//       // Asegurarse de recalcular el tamaño después de renderizar
//       map.invalidateSize();
//     }

//     // Limpiar el mapa al desmontar
//     return () => {
//       if (mapRef.current) {
//         const mapInstance = mapRef.current._leaflet_id;
//         if (mapInstance) {
//           mapInstance.remove();
//         }
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <div
//         id="map-container"
//         ref={mapRef}
//         style={{ height: "500px", width: "100%", border: "2px solid red" }}
//       ></div>
//     </div>
//   );
// };

export default Mapa;
