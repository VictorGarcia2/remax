import React, { useEffect, useState, memo, useCallback, useRef, useMemo } from "react";
import Search from "./Search";
import { useSearchContext } from "../../context/SearchContext";

// Componente de imagen optimizado con carga perezosa
const BackgroundImage = memo(({ src, alt, loading, fetchPriority, onLoad, decoding }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  useEffect(() => {
    // Si la imagen ya está en caché y completa, activa el estado cargado.
    if (imgRef.current?.complete) {
      handleLoad();
    }
  }, [handleLoad]);

  return (
    <>
      <img
        ref={imgRef}
        key={src} // Añadir key para forzar el re-renderizado si cambia el src
        className={`object-cover h-[536px] w-full sm:h-[680px] 2xl:h-[900px] transition-opacity duration-500 absolute inset-0 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        src={src}
        alt={alt}
        loading={loading || "lazy"} // Default a lazy si no se provee
        fetchPriority={fetchPriority || "auto"} // Default a auto
        onLoad={handleLoad}
        decoding={decoding || "async"} // Default a async
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </>
  );
});

BackgroundImage.displayName = "BackgroundImage";

// Componente principal optimizado
const HomeSearch = memo(
  ({ autoCompleteHome, setAutoCompleteHome, setBusqueda, valor }) => {
    const { selectedOptionsOperacion, setSelectedOptionsOperacion } =
      useSearchContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [data, setData] = useState([]); // Considerar si este estado es realmente necesario aquí o puede ser levantado/contextualizado
    const [selectedKey, setSelectedKey] = useState(null);
    const [lcpImageLoaded, setLcpImageLoaded] = useState(false); // Nuevo estado para la imagen LCP
    const intervalRef = useRef(null);
    const preloadedImagesRef = useRef(new Set()); // Para rastrear imágenes ya precargadas (no LCP)

    // Optimizar la definición de imágenes con memoización
    const images = React.useMemo(() => {
      const imagesByValor = {
        comercial: [
          "/HomePageContent/comercial/Comercial-oficina2.webp", // LCP para comercial
          "/HomePageContent/comercial/Comercial-rancho.webp",
          "/HomePageContent/comercial/Comercial-nave.webp",
          "/HomePageContent/comercial/Comercial-local.webp",
        ],
        residencial: [
          "/fotosdesarrollo/trebol 3.webp",
          "/HomePageContent/residencial/residencial-condominio.webp", // LCP para residencial
          "/HomePageContent/residencial/3.webp",
          "/HomePageContent/residencial/residencial-interiordepa.webp",
          "/HomePageContent/residencial/residencial-casa2.webp",
        ],
      };
      // Asegurarse de que siempre haya un array, incluso si 'valor' no es esperado.
      return imagesByValor[valor] || imagesByValor.residencial;
    }, [valor]);

    // Efecto para precargar imágenes no LCP después de que LCP haya cargado
    useEffect(() => {
      if (lcpImageLoaded && images.length > 1) {
        const preloadRemainingImages = () => {
          images.slice(1).forEach(src => {
            if (!preloadedImagesRef.current.has(src)) {
              const img = new Image();
              img.src = src;
              img.onload = () => {
                preloadedImagesRef.current.add(src);
              };
              // Opcional: manejar errores de carga de precarga
              // img.onerror = () => { console.error("Failed to preload image:", src); };
            }
          });
        };

        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(preloadRemainingImages, { timeout: 2000 });
        } else {
          setTimeout(preloadRemainingImages, 1500); // Un retraso razonable
        }
      }
    }, [lcpImageLoaded, images]);


    // Control de slides optimizado: Iniciar solo después de que LCP cargue y si hay múltiples imágenes
    useEffect(() => {
      if (!lcpImageLoaded || images.length <= 1) {
        // Si LCP no ha cargado o solo hay una imagen, no iniciar el carrusel.
        // Limpiar intervalo si existiera (ej. si 'valor' cambia y detiene el carrusel)
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [images, lcpImageLoaded]); // Depender de images.length y lcpImageLoaded

    // Sincronizar selectedKey desde localStorage (optimizado)
    useEffect(() => {
      const stored = localStorage.getItem("selectedKey");
      if (stored) {
        setSelectedKey(stored);
      } else {
        setSelectedKey(valor);
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
          description: "Locales, oficinas, bodegas y más para tu empresa",
          buttonText: "Ver propiedades comerciales",
          iconClass: "icon-commercial"
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
          description: "Casas, departamentos y terrenos para vivir",
          buttonText: "Ver propiedades residenciales",
          iconClass: "icon-residential"
        },
      ];

      return content.find((item) => item.key === valor) || content[0];
    }, [valor]);

    // Memoizar el contenido del header
    // const headerContent = useMemo(() => (
    //   <Header setSelectedOptionsOperacion={setSelectedOptionsOperacion} />
    // ), [setSelectedOptionsOperacion]);

    // Memoizar el contenido del search
    const searchContent = useMemo(() => (
      <Search
        valor={valor}
        data={data}
        setData={setData}
        setBusqueda={setBusqueda}
        autoCompleteHome={autoCompleteHome}
        setAutoCompleteHome={setAutoCompleteHome}
      />
    ), [valor, data, setBusqueda, autoCompleteHome, setAutoCompleteHome]);

    return (
      <div className="w-full relative h-[536px] sm:h-[680px] 2xl:h-[900px]"> {/* Asegurar altura del contenedor principal */}
        <div className="w-full absolute z-10">
          {/* headerContent eliminado */}
          <div className="text-center static w-[336px] 2xl:mt-70 font-display flex flex-col justify-content-center items-center text-white mx-auto mt-35 sm:mt-60">
            <p className="text-4xl sm:text-3xl sm:w-[730px] md:text-6xl lg:w-[730px]">
              {selectedContent.tittle}
            </p>
            {searchContent}
          </div>
        </div>
        <div className="h-full w-full absolute z-0 bg-gradient-to-t from-black/60 to-transparent"></div> {/* Usar h-full */}
        
        {/* Renderizar la primera imagen (LCP) siempre, con alta prioridad */}
        {images.length > 0 && (
          <BackgroundImage
            key={images[0] + "-lcp"} // Key única para la imagen LCP
            src={images[0]}
            alt="Imagen de fondo principal"
            loading="eager"
            fetchPriority="high"
            onLoad={() => setLcpImageLoaded(true)}
            decoding="async"
          />
        )}

        {/* Renderizar la imagen actual del carrusel (si es diferente de la LCP y LCP ya cargó) */}
        {/* Se muestra solo si LCP ha cargado, hay más de una imagen, y el índice actual no es la LCP (0) O si es la LCP pero ya está cargada */}
        {lcpImageLoaded && images.length > 1 && images[currentIndex] !== images[0] && (
          <BackgroundImage
            key={images[currentIndex] + "-carousel"} // Key única para la imagen del carrusel
            src={images[currentIndex]}
            alt={`Imagen de fondo ${currentIndex + 1}`}
            loading="lazy" // Carga perezosa para imágenes del carrusel
            fetchPriority="auto"
            decoding="async"
          />
        )}
        
        {/* Placeholder visual mientras la LCP carga, solo si hay imágenes y LCP no ha cargado */}
        {images.length > 0 && !lcpImageLoaded && (
             <div className="absolute inset-0 bg-gray-300 animate-pulse" /> // Placeholder más simple
        )}
      </div>
    );
  }
);

HomeSearch.displayName = "HomeSearch";

export default HomeSearch;
