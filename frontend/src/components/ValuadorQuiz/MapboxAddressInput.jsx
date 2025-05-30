import React, { useState, useEffect, useRef } from 'react';
import { useMapboxAutocomplete } from '../../hooks/useMapboxAutocomplete';

const MapboxAddressInput = ({ value, onChange, disabled }) => {
  const { query, suggestions, getPlacePredictions } = useMapboxAutocomplete();
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
    const address = suggestion.place_name;
    setInputValue(address);
    setShowSuggestions(false);
    updateValue(address, houseNumber);
  };

  return (
    <div className="space-y-4 w-full" ref={wrapperRef}>
      <div className="relative w-full">
        <input
          type="text"
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-700 text-lg transition-all"
          placeholder="Ingresa la dirección de tu propiedad"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          autoComplete="off"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{suggestion.place_name}</p>
                    <p className="text-xs text-gray-500">
                      {suggestion.category === "ciudad" ? "Ciudad" : "Dirección"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <input
          type="text"
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-700 text-lg transition-all"
          placeholder="Número exterior *"
          value={houseNumber}
          onChange={handleHouseNumberChange}
          disabled={disabled}
          required
        />
      </div>
    </div>
  );
};

export default MapboxAddressInput;