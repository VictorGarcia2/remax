import React, { useEffect, useState, memo, useCallback, useRef, useMemo } from "react";
import Header from "./Header";
import Search from "./Search";
import { useSearchContext } from "../../context/SearchContext";

// Componente de imagen optimizado con carga perezosa
const BackgroundImage = memo(({ src, alt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setImageLoaded(true);
    }
  }, []);

  return (
    <>
      <img
        ref={imgRef}
        className={`object-cover h-[536px] w-full sm:h-[680px] 2xl:h-[900px] transition-opacity duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        src={src}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        onLoad={() => setImageLoaded(true)}
        decoding="async"
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
    const [data, setData] = useState([]);
    const [selectedKey, setSelectedKey] = useState(null);
    const [imagesPreloaded, setImagesPreloaded] = useState(false);
    const intervalRef = useRef(null);
    const preloadedImagesRef = useRef(new Set());

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
          "/fotosdesarrollo/TREBOL 5.0.webp",
          "/HomePageContent/residencial/residencial-interiordepa.webp",
          "/HomePageContent/residencial/residencial-condominio.webp",
          "/HomePageContent/residencial/residencial-casa2.webp",
        ],
      };

      return (
        imagesByValor[valor] || [
          "/HomePageContent/comercial/Comercial-bodega.webp",
          "/HomePageContent/comercial/Comercial-terreno2.webp",
        ]
      );
    }, [valor]);

    // Precargar imágenes de manera optimizada
    useEffect(() => {
      if (!imagesPreloaded) {
        const preloadImage = (src) => {
          if (preloadedImagesRef.current.has(src)) return;
          
          const img = new Image();
          img.src = src;
          img.onload = () => {
            preloadedImagesRef.current.add(src);
            if (preloadedImagesRef.current.size === 1) {
              setImagesPreloaded(true);
            }
          };
        };

        // Precargar primera imagen inmediatamente
        preloadImage(images[0]);

        // Precargar resto de imágenes en segundo plano
        const preloadRemaining = () => {
          images.slice(1).forEach(preloadImage);
        };

        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(preloadRemaining);
        } else {
          setTimeout(preloadRemaining, 1000);
        }
      }
    }, [images, imagesPreloaded]);

    // Control de slides optimizado
    useEffect(() => {
      if (!imagesPreloaded) return;

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [images, imagesPreloaded]);

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
    const headerContent = useMemo(() => (
      <Header setSelectedOptionsOperacion={setSelectedOptionsOperacion} />
    ), [setSelectedOptionsOperacion]);

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
      <div className="w-full relative">
        <div className="w-full absolute z-10">
          {headerContent}
          <div className="text-center static w-[336px] 2xl:mt-70 font-display flex flex-col justify-content-center items-center text-white mx-auto mt-35 sm:mt-60">
            <p className="text-4xl sm:text-3xl sm:w-[730px] md:text-6xl lg:w-[730px]">
              {selectedContent.tittle}
            </p>
            {searchContent}
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
  }
);

HomeSearch.displayName = "HomeSearch";

export default HomeSearch;
