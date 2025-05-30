import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapboxAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Aseguramos que el token de acceso esté disponible
  mapboxgl.accessToken = "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";

  const getPlacePredictions = async (input) => {
    setQuery(input);
    
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          input
        )}.json?access_token=${mapboxgl.accessToken}&types=place,address&language=es&country=MX`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Filtramos y etiquetamos los resultados
        const filteredData = data.features.map((item) => {
          if (item.place_type.includes("place")) {
            return { ...item, category: "ciudad" };
          } else if (item.place_type.includes("address")) {
            return { ...item, category: "direccion" };
          }
          return item;
        });
        setSuggestions(filteredData);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error al buscar lugar:", error);
      setSuggestions([]);
    }
  };

  // Limpiamos las sugerencias cuando el componente se desmonta
  useEffect(() => {
    return () => {
      setSuggestions([]);
    };
  }, []);

  return {
    query,
    suggestions,
    getPlacePredictions,
  };
};