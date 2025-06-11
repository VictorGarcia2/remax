import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import ReactDOMServer from "react-dom/server";
// import mapboxgl from "mapbox-gl"; // Eliminamos la importación estática
import "mapbox-gl/dist/mapbox-gl.css"; // Mantenemos la importación del CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useSearchContext } from "../context/SearchContext";
import debounce from 'lodash/debounce';
import ReactDOM from "react-dom";

// mapboxgl.accessToken = // Eliminamos la configuración del token aquí
//   "pk.eyJ1IjoidmljdGorefA.ILrTXW_4c9_pbGC3Uj-wdg";

const MapboxConCards = ({
  busqueda,
  manejoBusqueda,
  setPropiedadesVisibles,
  propiedades,
  setAutoCompleteHome,
  selectedOptions,
  nuevas,
  setNuevas,
  precioMinimo,
  precioMaximo,
  seleccion,
  setSeleccion
}) => {

  const { 
    busquedaHome,
    setBusquedaHome,
    selectedOptionsTipos,
    setSelectedOptionsTipos,
    selectedOptionsOperacion, 
    setSelectedOptionsOperacion,
    valor
  } = useSearchContext();
  
  const [mapIsReady, setMapIsReady] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapLoadedRef = useRef(false);
  const [shareModalOpen, setShareModalOpen] = useState(true);
  const geocodingCache = useRef(new Map());
  const [mapboxglInstance, setMapboxglInstance] = useState(null);

  // Memoizar el filtrado de propiedades
  const propiedadesFiltradas = useMemo(() => {
    const noHayFiltros =
      selectedOptionsTipos.length === 0 &&
      precioMinimo === 0 &&
      precioMaximo === Infinity &&
      selectedOptionsOperacion.length === 0 &&
      selectedOptions.length === 0;

    if (noHayFiltros) return propiedades;

    const tiposSeleccionados = selectedOptionsTipos.map(Number);
    const sectoresSeleccionados = Array.isArray(selectedOptions)
      ? selectedOptions.filter(Boolean).map(String)
      : [];
    const operacionesSeleccionadas = Array.isArray(selectedOptionsOperacion)
      ? selectedOptionsOperacion.filter(Boolean).map(String)
      : [];

    return propiedades.filter((item) => {
      const precio = parseFloat(item.mxn_corriente) || 0;
      const cumplePrecio = precio >= precioMinimo && precio <= precioMaximo;
      const numero = parseFloat(item.tipos?.tipo_id);
      const cumpleTipos =
        tiposSeleccionados.length === 0 || tiposSeleccionados.includes(numero);
      const cumpleOperaciones =
        operacionesSeleccionadas.length === 0 ||
        operacionesSeleccionadas.includes(item.operacion);
      const cumpleSector =
        sectoresSeleccionados.length === 0 ||
        sectoresSeleccionados.includes(item.sector);

      return cumplePrecio && cumpleTipos && cumpleOperaciones && cumpleSector;
    });
  }, [
    selectedOptionsTipos,
    selectedOptionsOperacion,
    selectedOptions,
    propiedades,
    precioMinimo,
    precioMaximo,
  ]);

  // Efecto para cargar dinámicamente la librería mapboxgl
  useEffect(() => {
    import('mapbox-gl').then((module) => {
      const loadedMapboxgl = module.default;
      loadedMapboxgl.accessToken = "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";
      setMapboxglInstance(loadedMapboxgl);
    });
  }, []); // Se ejecuta solo una vez para cargar la librería

  // Efecto para inicializar el mapa una vez que mapboxglInstance y el contenedor estén listos
  useEffect(() => {
    if (!mapContainerRef.current || !mapboxglInstance) return;
    if (mapRef.current) return; // Evitar la reinicialización si el mapa ya existe

    mapRef.current = new mapboxglInstance.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-96.135744, 19.172264],
      zoom: 11,
      maxZoom: 18,
      minZoom: 5,
      renderWorldCopies: false,
      preserveDrawingBuffer: false,
      antialias: false,
    });

    mapRef.current.addControl(new mapboxglInstance.NavigationControl());

    mapRef.current.on("load", () => {
      mapLoadedRef.current = true;
      setMapIsReady(true);
      // Los marcadores iniciales se añadirán en el siguiente useEffect
      actualizarVisibles();
    });

    const debouncedUpdateVisibles = debounce(() => {
      actualizarVisibles();
    }, 100);

    mapRef.current.on("moveend", debouncedUpdateVisibles);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [mapboxglInstance]); // Depende de mapboxglInstance para ejecutarse cuando esté cargado

  // Actualizar markers cuando cambian las propiedades filtradas o el valor del contexto
  useEffect(() => {
    if (!mapLoadedRef.current || !mapboxglInstance) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    if (propiedadesFiltradas.length > 0) {
      agregarMarkers(propiedadesFiltradas, mapboxglInstance);
    }

    actualizarVisibles();
  }, [mapIsReady, propiedadesFiltradas, mapboxglInstance, valor]); // Añadimos valor como dependencia

  const abreviarPrecio = (valor) => {
    if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
    if (valor >= 1_000) return `${(valor / 1_000).toFixed(0)}K`;
    return valor.toString();
  };

  const PopupContent = React.memo(({ prop, seleccion, valor }) => {
    const [isLoading, setIsLoading] = useState(true);
    const imagenesArray = prop.imagenes.split(",");
    const popupRef = useRef(null);

    return (
      <div 
        ref={popupRef}
        className="w-64 md:w-[300px] flex flex-col justify-center items-center bg-white rounded-lg md:rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Contenedor de imagen */}
        <div className="relative w-full">
          <img
            loading="lazy"
            className="w-full h-40 md:h-[200px] object-cover"
            src={`https://cdn.remax.com.mx/properties/${prop.propiedad_id}/${imagenesArray[0]}`}
            alt={`Imagen de ${prop.calle}`}
            onLoad={() => setIsLoading(false)}
            width="300" // Mantener para aspect ratio, pero Tailwind controla el tamaño
            height="200" // Mantener para aspect ratio, pero Tailwind controla el tamaño
          />
          {/* Badge de operación */}
          <div className={`absolute top-2 right-2 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold text-white ${
            valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
          }`}>
            {prop.operacion === "1" ? "Venta" : prop.operacion === "2" ? "Renta" : "N/A"}
          </div>
        </div>

        {/* Contenido del popup */}
        <div className="w-full p-3 md:p-4 space-y-1 md:space-y-2">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">
            {abreviarPrecio(prop.mxn_corriente)} MXN
          </h3>
          
          <p className="text-xs md:text-sm text-gray-600">{prop.calle}</p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs md:text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{prop.tipos?.tipo_nombre || "Tipo"}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{prop.m2_construccion}m²</span>
            </div>
          </div>
          {/* El badge de operación se movió dentro del contenedor de la imagen para mejor control de posición */}
        </div>

        {/* Botón de acción */}
        <div className="w-full p-3 md:p-4 pt-1 md:pt-2">
          <a
            href={`/propiedades/seleccion/${prop.propiedad_id}`}
            className={`w-full text-white text-center py-1.5 md:py-2 px-3 md:px-4 text-sm md:text-base rounded-lg transition-colors duration-200 block ${
              valor === "comercial" ? "bg-redRemax hover:bg-red-700" : "bg-blueRemax hover:bg-blue-700"
            }`}
          >
            Ver detalles
          </a>
        </div>
      </div>
    );
  });

  const updatePopupImage = (popupElement, prop, newIndex) => {
    const imagenesArray = prop.imagenes.split(",");
    const imgElement = popupElement.querySelector('img');
    const counterElement = popupElement.querySelector('.image-counter');
    
    if (imgElement && counterElement) {
      // Actualizar el contador
      counterElement.textContent = `${newIndex + 1}/${imagenesArray.length}`;

      // Crear una nueva imagen para precargar
      const newImg = new Image();
      newImg.onload = () => {
        // Una vez que la nueva imagen está cargada, actualizar la imagen visible
        imgElement.src = newImg.src;
      };
      newImg.onerror = () => {
        console.error('Error al cargar la imagen:', newImg.src);
      };
      newImg.src = `https://cdn.remax.com.mx/properties/${prop.propiedad_id}/${imagenesArray[newIndex]}`;
    }
  };

  const agregarMarkers = (lista, mapboxgl) => {
    const fragment = document.createDocumentFragment();
    const markers = [];

    for (const prop of lista) {
      if (!prop.longitud || !prop.latitud) continue;

      const el = document.createElement("div");
      el.style.background = valor === "comercial" ? "#e63946" : "#0077ff";
      el.style.color = "#fff";
      el.style.padding = "8px 12px";
      el.style.borderRadius = "100px";
      el.style.fontSize = "14px";
      el.style.fontWeight = "bold";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";
      el.style.whiteSpace = "nowrap";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.minWidth = "80px";
      el.style.height = "32px";
      el.textContent = `${abreviarPrecio(prop.mxn_corriente)} MXN`;
      el.dataset.valorOriginal = prop.mxn_corriente;

      const marker = new mapboxgl.Marker({ 
        element: el,
        anchor: 'bottom',
        offset: [0, -10]
      })
        .setLngLat([parseFloat(prop.longitud), parseFloat(prop.latitud)])
        .setPopup(
          new mapboxgl.Popup({ 
            closeButton: true, 
            closeOnClick: true,
            maxWidth: '300px',
            offset: 25,
            className: 'custom-popup'
          })
        );

      // Crear el contenido del popup
      const popupContent = ReactDOMServer.renderToString(
        <PopupContent prop={prop} seleccion={seleccion} valor={valor} />
      );

      // Agregar el contenido al popup
      marker.getPopup().setHTML(popupContent);

      markers.push({ marker, prop, el });
    }

    markersRef.current = markers;
    markers.forEach(({ marker }) => marker.addTo(mapRef.current));

    // Función para actualizar la visibilidad de los precios según el zoom
    const updateMarkersVisibility = () => {
      const zoom = mapRef.current.getZoom();
      const zoomThreshold = 12; // Nivel de zoom a partir del cual se muestran los precios

      markersRef.current.forEach(({ el }) => {
        if (zoom < zoomThreshold) {
          el.style.minWidth = "16px";
          el.style.width = "16px";
          el.style.height = "16px";
          el.style.padding = "0";
          el.style.borderRadius = "50%";
          el.textContent = "";
        } else {
          el.style.minWidth = "80px";
          el.style.width = "auto";
          el.style.height = "32px";
          el.style.padding = "8px 12px";
          el.style.borderRadius = "100px";
          el.textContent = `${abreviarPrecio(el.dataset.valorOriginal)} MXN`;
        }
      });
    };

    // Agregar listener para el evento zoom
    mapRef.current.on('zoom', updateMarkersVisibility);
    // Ejecutar una vez al inicio
    updateMarkersVisibility();
  };

  const actualizarVisibles = () => {
    if (!mapRef.current) return;
    
    const bounds = mapRef.current.getBounds();
    const visibles = markersRef.current
      .filter(({ prop }) =>
        bounds.contains([parseFloat(prop.longitud), parseFloat(prop.latitud)])
      )
      .map(({ prop }) => prop);
    setPropiedadesVisibles(visibles);
  };

  // Definir actualizarMapaConFeature como una función regular (no un useCallback)
  const actualizarMapaConFeature = (feature) => {
    if (!mapRef.current) return;

        const [longitud, latitud] = feature.center;
        mapRef.current.flyTo({ center: [longitud, latitud], zoom: 13 });

        if (mapRef.current.getLayer("limite-colonia")) {
          mapRef.current.removeLayer("limite-colonia");
        }
        if (mapRef.current.getSource("limite-colonia")) {
          mapRef.current.removeSource("limite-colonia");
        }

        if (feature.bbox) {
          const [[minLng, minLat], [maxLng, maxLat]] = [
            [feature.bbox[0], feature.bbox[1]],
            [feature.bbox[2], feature.bbox[3]],
          ];

          const geojsonPolygon = {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [minLng, minLat],
                  [maxLng, minLat],
                  [maxLng, maxLat],
                  [minLng, maxLat],
                  [minLng, minLat],
                ],
              ],
            },
          };

          mapRef.current.addSource("limite-colonia", {
            type: "geojson",
            data: geojsonPolygon,
          });

          mapRef.current.addLayer({
            id: "limite-colonia",
            type: "line",
            source: "limite-colonia",
            paint: {
              "line-color": "#0077ff",
              "line-width": 3,
              "line-dasharray": [2, 2],
            },
          });
        }
    };

  const manejarBusqueda = useCallback(async (lugar) => {
    if (!lugar || !mapboxglInstance || !mapRef.current) return;

    // Verificar caché
    if (geocodingCache.current.has(lugar)) {
      const data = geocodingCache.current.get(lugar);
      setAutoCompleteHome(data.features);
      if (data.features.length > 0) {
        actualizarMapaConFeature(data.features[0]);
      }
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          lugar
        )}.json?access_token=${mapboxglInstance.accessToken}`
      );
      const data = await response.json();
      
      // Guardar en caché
      geocodingCache.current.set(lugar, data);
      
      setAutoCompleteHome(data.features);
      if (data.features.length > 0) {
        actualizarMapaConFeature(data.features[0]);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  }, [mapboxglInstance, setAutoCompleteHome, mapRef]); // Eliminar actualizarMapaConFeature de las dependencias

  useEffect(() => {
    const lugar = busqueda || busquedaHome;
    if (lugar) {
      manejarBusqueda(lugar);
    }
  }, [manejarBusqueda, busquedaHome, busqueda]);

  return (
    <>
    <div className=" flex flex-col lg:flex-row gap-4">
      <div className=" w-full h-[400px] lg:h-[700px] relative">
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%" }}
          className="lg:rounded-xl overflow-hidden"
        />
      </div>
    </div>
          </>
  );
};

export default React.memo(MapboxConCards);
