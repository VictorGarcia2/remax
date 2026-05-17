import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Añadir importación de axios

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
  const [valor, setValor] = useState("residencial");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Nuevos estados
  const [propiedades, setPropiedades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [propiedadesVisibles, setPropiedadesVisibles] = useState([]);
  const [autoCompleteHome, setAutoCompleteHome] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]); // Estado general de opciones seleccionadas
  const [nuevas, setNuevas] = useState(false);
  const [precioMinimo, setPrecioMinimo] = useState('');
  const [precioMaximo, setPrecioMaximo] = useState('');
  const [aplicarFiltros, setAplicarFiltros] = useState(false);
  const [seleccion, setSeleccion] = useState(null); // Para la selección de autocompletar

  // Mover la lógica de obtención de datos iniciales para propiedades
  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await axios.get(`${API_URL}/api/propiedades`);
        // El API devuelve { data: { rows: [...] } }
        const dataRows = response.data?.data?.rows || (Array.isArray(response.data) ? response.data : []);
        setPropiedades(dataRows);
      } catch (error) {
        console.error('Error al obtener las propiedades:', error);
      }
    };
    fetchPropiedades();
  }, []);

  // Función manejoBusqueda (si es necesario definirla aquí o pasar setBusqueda directamente)
  const manejoBusqueda = (event) => {
    setBusqueda(event.target.value);
  };


  
  
  return (
    <SearchContext.Provider 
      value={{
        selectedOptionsTipos,
        setSelectedOptionsTipos,
        busquedaHome,
        setBusquedaHome,
        selectedOptionsOperacion,
        setSelectedOptionsOperacion,
        valor,
        setValor,
        isFilterMenuOpen,
        setIsFilterMenuOpen,
        // Exponer nuevos estados y setters
        propiedades,
        setPropiedades,
        busqueda,
        setBusqueda,
        manejoBusqueda, // Exponer la función de manejo
        propiedadesVisibles,
        setPropiedadesVisibles,
        autoCompleteHome,
        setAutoCompleteHome,
        selectedOptions,
        setSelectedOptions,
        nuevas,
        setNuevas,
        precioMinimo,
        setPrecioMinimo,
        precioMaximo,
        setPrecioMaximo,
        aplicarFiltros,
        setAplicarFiltros,
        seleccion,
        setSeleccion
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};