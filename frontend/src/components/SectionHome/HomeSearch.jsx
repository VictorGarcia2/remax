import React, { useEffect, useState, memo, useCallback } from "react";
import Header from "./Header";
import Search from "./Search";
import { useSearchContext } from "../../context/SearchContext";

// Componente de imagen optimizado con carga perezosa
const BackgroundImage = memo(({ src, alt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <>
      <img
        className={`object-cover h-[536px] w-full sm:h-[680px] 2xl:h-[900px] transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        src={src}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        onLoad={() => setImageLoaded(true)}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </>
  );
});

BackgroundImage.displayName = 'BackgroundImage';

// Componente principal optimizado
const HomeSearch = memo(({
  autoCompleteHome,
  setAutoCompleteHome,
  setBusqueda,
  valor
}) => {
  // Usar solo los estados y contextos necesarios
  const { selectedOptionsOperacion, setSelectedOptionsOperacion } = useSearchContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  
  // Optimizar la definición de imágenes con memoización
  const images = React.useMemo(() => {
    const imagesByValor = {
      comercial: [
        "/HomePageContent/comercial/Comercial-oficina2.webp",
        "/HomePageContent/comercial/Comercial-rancho.webp",
        "/HomePageContent/comercial/Comercial-nave.webp",
        "/HomePageContent/comercial/Comercial-local.webp",
      ],
      residencial: [
        "/HomePageContent/residencial/3.webp",
        "/HomePageContent/residencial/residencial-interiordepa.webp",
        "/HomePageContent/residencial/residencial-condominio.webp",
        "/HomePageContent/residencial/residencial-casa2.webp",
      ],
    };
    
    return imagesByValor[valor] || [
      "/HomePageContent/comercial/Comercial-bodega.webp",
      "/HomePageContent/comercial/Comercial-terreno2.webp",
    ];
  }, [valor]);

  // Precargar imágenes para mejorar la experiencia de usuario
  useEffect(() => {
    if (!imagesPreloaded) {
      // Precargar solo la primera imagen inmediatamente
      const preloadImage = new Image();
      preloadImage.src = images[0];
      preloadImage.onload = () => setImagesPreloaded(true);
      
      // Precargar el resto de imágenes después
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          images.slice(1).forEach(src => {
            const img = new Image();
            img.src = src;
          });
        });
      } else {
        setTimeout(() => {
          images.slice(1).forEach(src => {
            const img = new Image();
            img.src = src;
          });
        }, 1000);
      }
    }
  }, [images, imagesPreloaded]);

  // Control de slides optimizado
  useEffect(() => {
    // Solo iniciar el intervalo cuando las imágenes estén precargadas
    if (!imagesPreloaded) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images, imagesPreloaded]);

  // Sincronizar selectedKey desde localStorage (optimizado)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedKey");
      setSelectedKey(stored || valor);
    }
  }, [valor]);
  
  // Guardar en localStorage (optimizado)
  useEffect(() => {
    if (selectedKey !== null) {
      localStorage.setItem("selectedKey", selectedKey);
    }
  }, [selectedKey]);

  // Contenido memoizado
  const selectedContent = React.useMemo(() => {
    const content = [
      {
        key: "comercial",
        tittle: (
          <>
            Encuentra el
            <span className="font-extrabold italic"> espacio </span>
            que tu negocio necesita
          </>
        ),
      },
      {
        key: "residencial",
        tittle: (
          <p className="text-3xl md:text-5xl">
            Empieza
            <span className="font-extrabold italic"> tu búsqueda: </span> 
            <br /> encuentra tu hogar
            <span className="font-extrabold italic"> soñado </span>
          </p>
        ),
      },
    ];
    
    return content.find(item => item.key === valor) || content[0];
  }, [valor]);

  return (
    <div className="w-full">
      <div className="w-full absolute z-10">
        <Header setSelectedOptionsOperacion={setSelectedOptionsOperacion} />
        <div className="text-center w-[336px] 2xl:mt-70 font-display flex flex-col justify-content-center items-center text-white mx-auto mt-35 sm:mt-40">
          <p className="text-4xl sm:text-3xl sm:w-[730px] md:text-6xl lg:w-[730px]">
            {selectedContent.tittle}
          </p>
          <Search
            valor={valor}
            data={data}
            setData={setData}
            setBusqueda={setBusqueda}
            autoCompleteHome={autoCompleteHome}
            setAutoCompleteHome={setAutoCompleteHome}
          />
        </div>
      </div>
      <div className="h-[536px] sm:h-[680px] 2xl:h-[900px] w-full absolute z-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      {imagesPreloaded && (
        <BackgroundImage 
          src={images[currentIndex]} 
          alt="Imagen de fondo" 
        />
      )}
    </div>
  );
});

HomeSearch.displayName = 'HomeSearch';

export default HomeSearch;