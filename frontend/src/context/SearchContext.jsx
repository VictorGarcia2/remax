import { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto
export const SearchContext = createContext();

// Hook personalizado para usar el contexto
export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext debe ser usado dentro de un SearchProvider');
  }
  return context;
};

// Proveedor del contexto
export const SearchProvider = ({ children }) => {
  const [selectedOptionsTipos, setSelectedOptionsTipos] = useState([]);
  const [busquedaHome, setBusquedaHome] = useState('');
  const [selectedOptionsOperacion, setSelectedOptionsOperacion] = useState([]);
  useEffect(() => {
    console.log("selectedOptionsTipos desde contexto:", selectedOptionsTipos);
  }, [selectedOptionsTipos]);
  
  return (
    <SearchContext.Provider 
      value={{
        selectedOptionsTipos,
        setSelectedOptionsTipos,
        busquedaHome,
        setBusquedaHome,
        selectedOptionsOperacion,
        setSelectedOptionsOperacion
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};