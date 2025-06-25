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

  // Nuevos estados
  const [propiedades, setPropiedades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [propiedadesVisibles, setPropiedadesVisibles] = useState(10);
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
        const response = await axios.get('https://remaxcin.com/api/propiedades');
        setPropiedades(response.data);
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
        setSelectedOptionsOperacion,
        valor,
        setValor,
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