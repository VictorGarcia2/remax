import React, { useCallback, useEffect, useState, useMemo, lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  AlertCircle, 
  List, 
  Map as MapIcon, 
  X,
  Share2 
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useSearchContext } from "../context/SearchContext"; // Importar useSearchContext
import GoogleMapsConCards from "./GoogleMapsConCards";

// Función de utilidad para truncar texto
const truncateByCharacters = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength
    ? text.substring(0, maxLength) + "..."
    : text;
};

// Componente de imagen optimizado
const OptimizedImage = React.memo(({ src, alt, className, onClick }) => (
  <img
    loading="lazy"
    className={className}
    src={src}
    alt={alt}
    onClick={onClick}
    width={353}
    height={198}
  />
));

// Componente de flecha optimizado
const ArrowButton = React.memo(({ src, alt, onClick, className }) => (
  <img
    loading="lazy"
    onClick={onClick}
    src={src}
    alt={alt}
    className={className}
  />
));

// Componente de card individual
const PropertyCard = React.memo(({ 
  item, 
  currentIndex, 
  onPrevious, 
  onNext, 
  onShare, 
  setSeleccion,
  index 
}) => {
  const imagenesArray = useMemo(() => (item.imagenes || '').split(","), [item.imagenes]);
  const { valor } = useSearchContext(); // Obtener el valor del contexto
  
  return (
    <div className="w-full flex flex-col mt-5 mb-30 lg:mb-20 justify-center items-center">
      <div className="flex absolute justify-around z-10 mx-auto gap-70 xl:gap-40 2xl:gap-50">
        <ArrowButton
          src="/HomePageContent/arrowizq.svg"
          alt="Anterior"
          onClick={() => onPrevious(index)}
          className="cursor-pointer"
        />
        <ArrowButton
          src="/HomePageContent/arrowderecha.svg"
          alt="Siguiente"
          onClick={() => onNext(index)}
          className="cursor-pointer"
        />
      </div>

      <div className="flex">
        <OptimizedImage
          className="w-[353px] h-[198px] object-cover rounded-2xl"
          src={`https://cdn.remax.com.mx/properties/${item.propiedad_id}/${imagenesArray[currentIndex]}`}
          alt={`Imagen ${currentIndex + 1}`}
        />
      </div>

      <p className="z-10 mt-27 absolute bg-black/40 rounded-full p-1 text-center text-white text-sm">
        {currentIndex + 1}/{imagenesArray.length}
      </p>

      <div className="w-[280px] 2xl:w-[280px] bg-white h-28 absolute mt-[260px] rounded-2xl shadow flex flex-col items-center pt-2 font-display">
        <Link
          id={item.propiedad_id}
          onClick={() => setSeleccion(item.propiedad_id)}
          to={`/propiedades/seleccion/${item.propiedad_id}`}
          className="text-center"
        >
          <p className="text-base font-bold text-[#7B7B7B]">
            {Number(item.mxn_corriente).toLocaleString("en-US")}MXN
          </p>
          <p className="text-base px-2 text-center w-[250px] font-[500] text-[#7B7B7B]">
            {truncateByCharacters(item.calle, 20)}
          </p>
          <div className="flex text-[#7B7B7B] font-[500] text-[15px]">
            <p className="text-center">
              {truncateByCharacters(item.tipos?.tipo_nombre, 15) || "Tipo"} |{" "}
            </p>
            <p className="text-center">
              {item.operacion === "1"
                ? "Venta"
                : item.operacion === "2"
                ? "Renta"
                : "N/A"}{" "}
              |
            </p>
            <p className="text-center">{item.m2_construccion}m²</p>
          </div>
        </Link>
        <div
          onClick={() => onShare(item.propiedad_id)}
          rel="noopener noreferrer"
          className={`rounded-2xl w-[73px] h-[29px] shadow-2xs py-1 flex items-center justify-center cursor-pointer mt-4 z-10 ${
            valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
          }`}
        >
          <FaWhatsapp className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
});

// Componente de Skeleton mejorado
const CardSkeleton = () => {
  return (
    <div className="w-full flex flex-col mt-5 mb-30 lg:mb-20 justify-center items-center">
      {/* Contenedor principal con efecto de brillo */}
      <div className="relative w-[280px] h-[198px] rounded-2xl overflow-hidden bg-gray-100">
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>

      {/* Skeleton para el contador de imágenes */}
      <div className="z-10 mt-27 absolute bg-gray-100/80 backdrop-blur-sm rounded-full px-4 py-1">
        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Skeleton para la card de información */}
      <div className="w-[280px] 2xl:w-[280px] bg-white h-28 absolute mt-[260px] rounded-2xl shadow-lg flex flex-col items-center pt-4">
        {/* Precio */}
        <div className="w-3/4 h-5 bg-gray-100 rounded-full mb-3 animate-pulse"></div>
        
        {/* Dirección */}
        <div className="w-4/5 h-4 bg-gray-100 rounded-full mb-3 animate-pulse"></div>
        
        {/* Detalles */}
        <div className="flex gap-2 items-center">
          <div className="w-20 h-4 bg-gray-100 rounded-full animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-100 rounded-full animate-pulse"></div>
          <div className="w-12 h-4 bg-gray-100 rounded-full animate-pulse"></div>
        </div>
        
        {/* Botón de WhatsApp */}
        <div className="w-[73px] h-[29px] bg-gray-100 rounded-2xl mt-4 animate-pulse"></div>
      </div>
    </div>
  );
};

// Estilos de shimmer inyectados como JSX en el componente (ver ShimmerStyles abajo)
const ShimmerStyles = () => (
  <style>{`
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
  `}</style>
);

export default function CardResultado() {
  // Estado estructurado para los índices de imagen por propiedad
  const [imageIndices, setImageIndices] = useState({});
  const imageCache = useRef(new Map());
  const { 
    valor, 
    seleccion, 
    setSeleccion,
    propiedades,
    setBusqueda,
    busqueda,
    manejoBusqueda,
    setPropiedadesVisibles,
    propiedadesVisibles,
    selectedOptions,
    setAutoCompleteHome,
    busquedaHome,
    setSelectedOptions,
    nuevas,
    setNuevas,
    precioMinimo,
    setPrecioMinimo,
    precioMaximo,
    setPrecioMaximo,
    aplicarFiltros,
    selectedOptionsTipos,
    selectedOptionsOperacion
  } = useSearchContext(); 
  const [isLoading, setIsLoading] = useState(true);

  // Precargar solo la primera imagen de cada propiedad visible (en vez de todas)
  useEffect(() => {
    if (Array.isArray(propiedadesVisibles)) {
      propiedadesVisibles.forEach(item => {
        const firstImage = (item.imagenes || '').split(",")[0];
        if (firstImage && !imageCache.current.has(`${item.propiedad_id}-${firstImage}`)) {
          const img = new Image();
          img.src = `https://cdn.remax.com.mx/properties/${item.propiedad_id}/${firstImage}`;
          imageCache.current.set(`${item.propiedad_id}-${firstImage}`, img);
        }
      });
    }
  }, [propiedadesVisibles]);

  // Actualizar estado de carga basado en datos reales (sin delay artificial)
  useEffect(() => {
    if (propiedadesVisibles) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [propiedadesVisibles]);

  const goToNext = useCallback((index) => {
    const propiedadId = propiedadesVisibles[index].propiedad_id;
    const imagenesArray = (propiedadesVisibles[index].imagenes || '').split(",").filter(Boolean);
    const totalImages = imagenesArray.length;
    setImageIndices(prev => ({
      ...prev,
      [propiedadId]: ((prev[propiedadId] || 0) + 1) % totalImages
    }));
  }, [propiedadesVisibles]);

  const goToPrevious = useCallback((index) => {
    const propiedadId = propiedadesVisibles[index].propiedad_id;
    const imagenesArray = (propiedadesVisibles[index].imagenes || '').split(",").filter(Boolean);
    const totalImages = imagenesArray.length;
    setImageIndices(prev => ({
      ...prev,
      [propiedadId]: ((prev[propiedadId] || 0) - 1 + totalImages) % totalImages
    }));
  }, [propiedadesVisibles]);

  const handleShare = useCallback((propiedadId) => {
    setShareModalOpen(false);
    setSeleccion(propiedadId);
  }, [setSeleccion]);

  const [mapa, setMapa] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(true);

  const mostrar = useMemo(() => [
    { icon: "faList", nombre: "Lista" },
    { icon: "faMap", nombre: "Mapa" }
  ], []);

  const handle = useCallback(() => {
    setMapa(prevState => !prevState);
  }, []);

  // FILTRADO CENTRALIZADO
  const propiedadesFiltradas = useMemo(() => {
    let filtradas = (Array.isArray(propiedades) ? propiedades : [])
      .filter((item) => {
        // Filtro por sector
        if (selectedOptions && selectedOptions.length > 0) {
          return selectedOptions.includes(item.sector);
        }
        return true;
      })
      .filter((item) => {
        // Filtro por tipo
        if (selectedOptionsTipos && selectedOptionsTipos.length > 0) {
          return selectedOptionsTipos.includes(Number(item.tipos?.tipo_id));
        }
        return true;
      })
      .filter((item) => {
        // Filtro por operación
        if (selectedOptionsOperacion && selectedOptionsOperacion.length > 0) {
          return selectedOptionsOperacion.includes(Number(item.operacion));
        }
        return true;
      })
      .filter((item) => {
        // Filtro por precio
        const precio = parseFloat(item.mxn_corriente) || 0;
        if (precioMinimo && precio < precioMinimo) return false;
        if (precioMaximo && precioMaximo !== Infinity && precio > precioMaximo) return false;
        return true;
      });
    // Filtro flexible por búsqueda de zona
    if (busquedaHome && busquedaHome.length > 0) {
      const textoBusqueda = busquedaHome.normalize('NFD').replace(/[ -]/g, '').toLowerCase();
      const resultado = filtradas.filter((item) => {
        const texto = `${item.calle} ${item.colonia} ${item.ciudad} ${item.estado}`.normalize('NFD').replace(/[ -]/g, '').toLowerCase();
        return texto.includes(textoBusqueda);
      });
      // Si no hay coincidencias, muestra todas (o puedes mostrar un mensaje especial si prefieres)
      return resultado.length > 0 ? resultado : filtradas;
    }
    return filtradas;
  }, [propiedades, selectedOptions, selectedOptionsTipos, selectedOptionsOperacion, precioMinimo, precioMaximo, busquedaHome]);

  // Estado para guardar las propiedades visibles en el mapa
  const [visiblesEnMapa, setVisiblesEnMapa] = useState(null);

  // Cuando cambia el área visible del mapa, actualizar el estado
  const handleSetPropiedadesVisibles = (visibles) => {
    setVisiblesEnMapa(visibles);
    if (setPropiedadesVisibles) setPropiedadesVisibles(visibles);
  };

  // Determinar qué propiedades mostrar en la lista
  const propiedadesParaLista = useMemo(() => {
    if (visiblesEnMapa && Array.isArray(visiblesEnMapa)) {
      // Si el mapa está filtrando y no hay propiedades visibles, no mostrar nada
      if (visiblesEnMapa.length === 0) {
        return [];
      }
      // Si hay propiedades visibles en el mapa, mostrar solo esas
      if (visiblesEnMapa.length > 0) {
        return visiblesEnMapa;
      }
    }
    // Si no, mostrar todas las filtradas
    return propiedadesFiltradas;
  }, [visiblesEnMapa, propiedadesFiltradas]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 justify-center z-10 items-start">
      {/* Modal de WhatsApp */}
      <div
        className={`${
          shareModalOpen && "invisible"
        } flex flex-col justify-center items-center fixed z-50 w-full h-full top-0 bg-white/70`}
      >
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="text-end">
                <X
                  size={32}
                  className="cursor-pointer ml-auto text-gray-500 hover:text-gray-800 transition-colors"
                  onClick={() => setShareModalOpen(true)}
                />
              </div>
              <div className="flex justify-center">
                <img
                  className="max-w-[200px]"
                  src="/logos/New_RMX_Mark_R4_RGB_dark.png"
                  alt=""
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Envianos mensaje por WhatsApp
              </h1>
              <p className="text-gray-600">
                Si estas interesado en esta propiedad, envíanos un mensaje
              </p>
            </div>

            <div className="flex justify-center">
              <button
                className={`inline-flex items-center cursor-pointer gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-colors duration-200 ${
                  valor === "comercial" ? "bg-redRemax hover:bg-redRemax/80" : "bg-blueRemax hover:bg-blueRemax/80"
                }`}
                aria-label="Contactar por WhatsApp"
                onClick={() => {
                  const mensaje = `Estoy interesado en esta propiedad: ${window.location.origin}/propiedades/seleccion/${seleccion}`;
                  const whatsappLink = `https://wa.me/5212292696629?text=${encodeURIComponent(
                    mensaje
                  )}`;
                  window.open(whatsappLink, "_blank");
                }}
              >
                <FaWhatsapp className="w-6 h-6" />
                <span className="text-sm sm:text-base md:text-lg">
                  Contactar por WhatsApp
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de cambio de vista */}
      <div className="fixed lg:invisible z-40 flex bottom-10 left-30 w-full">
        <button
          onClick={() => {
            handle();
            setMostrarMapa(prevState => (prevState === 0 ? 1 : 0));
          }}
          type="button"
          className={`inline-flex mx-auto gap-2 items-center px-4 py-2 text-sm font-medium text-white border-gray-900 rounded-3xl hover:text-white focus:z-10 focus:ring-2 focus:ring-opacity-50 ${
            valor === "comercial"
              ? "bg-redRemax border-redRemax hover:bg-redRemax focus:bg-redRemax focus:ring-redRemax"
              : "bg-blueRemax border-blueRemax hover:bg-blueRemax focus:bg-blueRemax focus:ring-blueRemax"
          }`}
        >
          {mostrarMapa === 0 ? <MapIcon size={18} /> : <List size={18} />}
          {mostrarMapa === 0 ? mostrar[1].nombre : mostrar[0].nombre}
        </button>
      </div>

      {/* Lista de propiedades */}
      <div
        className={`${
          mapa && "hidden"
        } overflow-y-scroll h-[660px] lg:h-[700px] relative`}
      >
        <div className="grid h-96 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 justify-center md:gap-3 items-center md:px-8 relative">
          {isLoading ? (
            // Mostrar skeletons mientras carga
            Array(6).fill().map((_, index) => (
              <CardSkeleton key={index} />
            ))
          ) : (
            propiedadesParaLista && propiedadesParaLista.length > 0 ? (
              propiedadesParaLista.map((item, index) => (
                <PropertyCard
                  key={item.propiedad_id}
                  item={item}
                  currentIndex={imageIndices[item.propiedad_id] || 0}
                  onPrevious={goToPrevious}
                  onNext={goToNext}
                  onShare={handleShare}
                  setSeleccion={setSeleccion}
                  index={index}
                />
              ))
            ) : (
              null
            )
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className={`${mapa ? "" : "invisible lg:visible"} mt-0 xl:visible w-full lg:h-[700px] lg:sticky lg:top-[calc(var(--header-height)_+_1rem)]`}>
        <GoogleMapsConCards />
      </div>
    </div>
  );
}
