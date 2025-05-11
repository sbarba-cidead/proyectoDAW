// import React, {useEffect, useState} from "react";
// import L from "leaflet";
// import { useMap, Polyline } from "react-leaflet";
// import "leaflet-routing-machine";
// import 'leaflet.locatecontrol';
// import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
// import Openrouteservice from 'openrouteservice';

// const MapComponent = () => {
//   const map = useMap();
//   const apiKey = "7851110001cf624801ddf7e2ea3c42d680724066022ffd94";
//   useEffect(() => { 
//     L.control.locate({
//       locateOptions: {
//         enableHighAccuracy: true
//       }
//     }).addTo(map);
//   });

//   const orsDirections = new Openrouteservice.Directions({
//     api_key: apiKey
//   })

//   orsDirections.calculate({
//     coordinates: [[8.681495,49.41461],[8.686507,49.41943],[8.687872,49.420318]],
//     profile: "driving-car",
//     extra_info: ["waytype", "steepness"],
//     format: "geojson",
//     api_version: 'v2',
//   })

//   .then(function(response) {
//     console.log(response);
    
//     if (response && response.features && response.features[0]) {
//       const feature = response.features[0];
//       const result = {
//         coordinates: [],
//       };
//         if (feature.geometry && Array.isArray(feature.geometry.coordinates)) {
//           result.coordinates = feature.geometry.coordinates;
//           const polyline = L.polyline(result.coordinates, {color: 'red'}).addTo(map);
//           map.fitBounds(polyline.getBounds());
//         }
//       }
//   })

//   .catch(function(error) {
//     console.log('Error:', error);
//   });
//   };

// export default MapComponent;

import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet.locatecontrol"; // asegúrate de importar esto así
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import Openrouteservice from "openrouteservice";

const MapLogic = () => {
  const map = useMap();
  const apiKey = "7851110001cf624801ddf7e2ea3c42d680724066022ffd94";

  useEffect(() => {
    if (!map) return;

    // Evitar error si el plugin no se ha registrado
    if (typeof L.control.locate !== "function") {
      console.error("leaflet.locatecontrol no está cargado correctamente.");
      return;
    }

    L.control.locate({
      locateOptions: { enableHighAccuracy: true },
    }).addTo(map);

    const orsDirections = new Openrouteservice.Directions({ api_key: apiKey });

    orsDirections
      .calculate({
        coordinates: [
          [8.681495, 49.41461],
          [8.686507, 49.41943],
          [8.687872, 49.420318],
        ],
        profile: "driving-car",
        extra_info: ["waytype", "steepness"],
        format: "geojson",
        api_version: "v2",
      })
      .then((response) => {
        if (response?.features?.[0]?.geometry?.coordinates) {
          const coords = response.features[0].geometry.coordinates;
          const polyline = L.polyline(coords.map(([lng, lat]) => [lat, lng]), {
            color: "red",
          }).addTo(map);
          map.fitBounds(polyline.getBounds());
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [map]);

  return null;
};

const MapComponent = () => (
  <MapContainer
    center={[49.41461, 8.681495]}
    zoom={15}
    style={{ height: "100vh", width: "100%" }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />
    <MapLogic />
  </MapContainer>
);

export default MapComponent;
