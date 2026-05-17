import React from 'react';
import { X } from "lucide-react";
import { useSearchContext } from '../context/SearchContext';

const ActiveFilters = () => {
  const { 
    selectedOptionsTipos,
    setSelectedOptionsTipos,
    selectedOptionsOperacion, 
    setSelectedOptionsOperacion,
    selectedOptions,
    setSelectedOptions,
    precioMinimo,
    setPrecioMinimo,
    precioMaximo,
    setPrecioMaximo
  } = useSearchContext();

  // Mapeo de nombres para mostrar
  const tipoNames = {
    1: "Casa",
    2: "Condominio",
    3: "Departamento", 
    4: "Terreno",
    5: "Terreno Residencial",
    6: "Desarrollo",
    7: "Bodega Industrial",
    8: "Edificio",
    9: "Local",
    10: "Terreno Comercial",
    14: "Finca/Rancho",
    19: "Bodega"
  };

  const operacionNames = {
    1: "Venta",
    2: "Renta"
  };

  const sectorNames = {
    "residencial": "Residencial",
    "comercial": "Comercial",
    "industrial": "Industrial"
  };

  const removeFilter = (type, value) => {
    switch(type) {
      case 'sector':
        setSelectedOptions(prev => prev.filter(item => item !== value));
        break;
      case 'tipo':
        setSelectedOptionsTipos(prev => prev.filter(item => item !== value));
        break;
      case 'operacion':
        setSelectedOptionsOperacion(prev => prev.filter(item => item !== value));
        break;
      case 'precioMin':
        setPrecioMinimo(0);
        break;
      case 'precioMax':
        setPrecioMaximo(Infinity);
        break;
    }
  };

  const clearAllFilters = () => {
    setSelectedOptions([]);
    setSelectedOptionsTipos([]);
    setSelectedOptionsOperacion([]);
    setPrecioMinimo(0);
    setPrecioMaximo(Infinity);
  };

  const hasActiveFilters = 
    selectedOptions.length > 0 || 
    selectedOptionsTipos.length > 0 || 
    selectedOptionsOperacion.length > 0 ||
    (precioMinimo > 0) ||
    (precioMaximo < Infinity);

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="w-full px-4 py-3 bg-gray-50 ">
      <div className="flex flex-wrap items-center gap-2 lg:px-18 ">
        <span className="text-sm font-medium text-gray-700 mr-2">Filtros activos:</span>
        
        {/* Filtros de Sector */}
        {selectedOptions.map((sector) => (
          <div key={`sector-${sector}`} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {sectorNames[sector] || sector}
            <button
              onClick={() => removeFilter('sector', sector)}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        ))}

        {/* Filtros de Tipo */}
        {selectedOptionsTipos.map((tipo) => (
          <div key={`tipo-${tipo}`} className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {tipoNames[tipo] || `Tipo ${tipo}`}
            <button
              onClick={() => removeFilter('tipo', tipo)}
              className="ml-1 hover:bg-green-200 rounded-full p-0.5"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        ))}

        {/* Filtros de Operación */}
        {selectedOptionsOperacion.map((operacion) => (
          <div key={`operacion-${operacion}`} className="inline-flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {operacionNames[operacion] || `Operación ${operacion}`}
            <button
              onClick={() => removeFilter('operacion', operacion)}
              className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        ))}

        {/* Filtro de Precio Mínimo */}
        {precioMinimo > 0 && (
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
            Desde ${precioMinimo.toLocaleString()} MXN
            <button
              onClick={() => removeFilter('precioMin')}
              className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        )}

        {/* Filtro de Precio Máximo */}
        {precioMaximo < Infinity && (
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
            Hasta ${precioMaximo.toLocaleString()} MXN
            <button
              onClick={() => removeFilter('precioMax')}
              className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        )}

        {/* Botón para limpiar todos los filtros */}
        <button
          onClick={clearAllFilters}
          className="inline-flex items-center text-red-600 hover:text-red-800 text-xs font-medium underline ml-2"
        >
          Limpiar todos
        </button>
      </div>
    </div>
  );
};

export default ActiveFilters;
