import { useState, useRef, useCallback } from 'react';

export const useGooglePlacesAutocomplete = (isLoaded) => {
  const [suggestions, setSuggestions] = useState([]);
  const serviceRef = useRef(null);

  const getPlacePredictions = useCallback((input) => {
    if (!isLoaded || !window.google || !window.google.maps) return;
    if (!serviceRef.current) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }
    serviceRef.current.getPlacePredictions(
      { input, componentRestrictions: { country: 'mx' }, language: 'es' },
      (preds, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !preds) {
          setSuggestions([]);
          return;
        }
        setSuggestions(preds);
      }
    );
  }, [isLoaded]);

  return {
    suggestions,
    getPlacePredictions,
  };
}; 