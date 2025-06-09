import { useState, useEffect, useRef, useCallback } from 'react';
// import mapboxgl from 'mapbox-gl'; // Eliminamos la importación estática
import debounce from 'lodash/debounce';

export const useMapboxAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const geocodingCache = useRef(new Map());

  // Aseguramos que el token de acceso esté disponible
  // mapboxgl.accessToken = "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";

  const getPlacePredictions = useCallback(
    debounce(async (input) => {
      setQuery(input);
      
      if (!input || input.length < 3) {
        setSuggestions([]);
        return;
      }

      // Verificar caché
      if (geocodingCache.current.has(input)) {
        setSuggestions(geocodingCache.current.get(input));
        return;
      }

      try {
        // Importar mapboxgl dinámicamente aquí
        const mapboxglModule = await import('mapbox-gl');
        const mapboxgl = mapboxglModule.default;
        const accessToken = "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            input
          )}.json?access_token=${accessToken}&types=place,address&language=es&country=MX`
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
          
          // Guardar en caché
          geocodingCache.current.set(input, filteredData);
          setSuggestions(filteredData);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error al buscar lugar:", error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Limpiar las sugerencias cuando el componente se desmonta
  useEffect(() => {
    return () => {
      setSuggestions([]);
      geocodingCache.current.clear();
    };
  }, []);

  return {
    query,
    suggestions,
    getPlacePredictions,
  };
};