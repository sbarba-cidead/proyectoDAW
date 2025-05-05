import React, {useEffect, useState} from "react";
import L from "leaflet";
import { useMap, Polyline } from "react-leaflet";
import "leaflet-routing-machine";
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import Openrouteservice from 'openrouteservice';

const MapComponent = () => {
  const map = useMap();
  const apiKey = "7851110001cf624801ddf7e2ea3c42d680724066022ffd94";
  useEffect(() => { 
    L.control.locate({
      locateOptions: {
        enableHighAccuracy: true
      }
    }).addTo(map);
  });

  const orsDirections = new Openrouteservice.Directions({
    api_key: apiKey
  })

  orsDirections.calculate({
    coordinates: [[8.681495,49.41461],[8.686507,49.41943],[8.687872,49.420318]],
    profile: "driving-car",
    extra_info: ["waytype", "steepness"],
    format: "geojson",
    api_version: 'v2',
  })

  .then(function(response) {
    console.log(response);
    
    if (response && response.features && response.features[0]) {
      const feature = response.features[0];
      const result = {
        coordinates: [],
      };
        if (feature.geometry && Array.isArray(feature.geometry.coordinates)) {
          result.coordinates = feature.geometry.coordinates;
          const polyline = L.polyline(result.coordinates, {color: 'red'}).addTo(map);
          map.fitBounds(polyline.getBounds());
        }
      }
  })

  .catch(function(error) {
    console.log('Error:', error);
  });
  };

export default MapComponent;