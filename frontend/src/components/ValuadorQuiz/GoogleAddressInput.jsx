import React, { useState, useEffect, useRef } from 'react';
import { useGooglePlacesAutocomplete } from '../../hooks/useGooglePlacesAutocomplete';
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from '../../config/googleMaps';

const GoogleAddressInput = ({ value, onChange, disabled }) => {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  const { suggestions, getPlacePredictions } = useGooglePlacesAutocomplete(isLoaded);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value?.address || '');
  const [houseNumber, setHouseNumber] = useState(value?.houseNumber || '');
  const wrapperRef = useRef(null);

  // Inicializar el valor del input si se proporciona
  useEffect(() => {
    if (value) {
      if (typeof value === 'object') {
        setInputValue(value.address || '');
        setHouseNumber(value.houseNumber || '');
      } else {
        setInputValue(value);
      }
    }
  }, [value]);

  // Cerrar sugerencias al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  // Manejar cambios en el input de dirección
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    getPlacePredictions(value);
    setShowSuggestions(true);
    updateValue(value, houseNumber);
  };

  // Manejar cambios en el input de número de casa
  const handleHouseNumberChange = (e) => {
    const value = e.target.value;
    setHouseNumber(value);
    updateValue(inputValue, value);
  };

  // Actualizar el valor combinado
  const updateValue = (address, number) => {
    onChange({
      address: address,
      houseNumber: number,
      fullAddress: number ? `${address} #${number}` : address
    });
  };

  // Seleccionar una sugerencia
  const handleSelectSuggestion = (suggestion) => {
    const address = suggestion.description;
    setInputValue(address);
    setShowSuggestions(false);
    updateValue(address, houseNumber);
  };

  // Render
  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blueRemax"
        placeholder="Ejemplo: Calle 123, Piso 2, Referencia... (opcional)"
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled || !isLoaded}
      />
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blueRemax"
        placeholder="Número exterior (opcional)"
        value={houseNumber}
        onChange={handleHouseNumberChange}
        disabled={disabled}
      />
      {/* Sugerencias de Google Places */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
          {suggestions.map((suggestion, idx) => (
            <li
              key={suggestion.place_id || idx}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoogleAddressInput;
