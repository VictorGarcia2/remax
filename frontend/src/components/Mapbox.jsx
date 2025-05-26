import React, { useEffect, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useSearchContext } from "../context/SearchContext";

mapboxgl.accessToken =
  "pk.eyJ1IjoidmljdG9yZ2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";

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
    setSelectedOptionsOperacion 
  } = useSearchContext();
  console.log(selectedOptionsTipos)
  const [mapIsReady, setMapIsReady] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapLoadedRef = useRef(false);
  const [shareModalOpen, setShareModalOpen] = useState(true);
  useEffect(() => {
    const noHayFiltros =
      selectedOptionsTipos.length === 0 &&
      precioMinimo === 0 &&
      precioMaximo === Infinity &&
      selectedOptionsOperacion.length === 0 &&
      selectedOptions.length === 0;

    if (noHayFiltros) {
      setNuevas(propiedades);
      return;
    }

    const tiposSeleccionados = selectedOptionsTipos.map(Number);
    const sectoresSeleccionados = Array.isArray(selectedOptions)
      ? selectedOptions.filter(Boolean).map(String)
      : [];
    const operacionesSeleccionadas = Array.isArray(selectedOptionsOperacion)
      ? selectedOptionsOperacion.filter(Boolean).map(String)
      : [];

    const filtered = propiedades.filter((item) => {
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

    setNuevas(filtered);
  }, [
    selectedOptionsTipos,
    selectedOptionsOperacion,
    selectedOptions,
    propiedades,
    precioMinimo,
    precioMaximo,
    setNuevas,
    busqueda,
  ]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-96.135744, 19.172264], // Veracruz
      zoom: 11,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl());

    mapRef.current.on("load", () => {
      mapLoadedRef.current = true;
      setMapIsReady(true);

      if (nuevas.length > 0) {
        agregarMarkers(nuevas);
        actualizarVisibles();
      }
    });

    mapRef.current.on("moveend", () => {
      actualizarVisibles();
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapLoadedRef.current) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    if (nuevas.length > 0) {
      agregarMarkers(nuevas);
    }

    actualizarVisibles();
  }, [mapIsReady, nuevas]);

  const abreviarPrecio = (valor) => {
    if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
    if (valor >= 1_000) return `${(valor / 1_000).toFixed(0)}K`;
    return valor.toString();
  };
  const PopupContent = ({ prop, seleccion }) => {
    const [currentIndex, setCurrentIndex] = useState(0); // Usar useState para el índice de la imagen
    const imagenesArray = prop.imagenes.split(","); // Convertir las imágenes en un array
   
    return (
      <div className="w-[300px] flex flex-col mt-5 mb-30 lg:mb-20 justify-center items-center">
        <div className="flex">
          <img
            loading="lazy"
            className=" w-[200px] h-[120px] lg:w-[280px] lg:h-[280px] object-cover rounded-t-2xl"
            src={`https://cdn.remax.com.mx/properties/${prop.propiedad_id}/${imagenesArray[currentIndex]}`}
            alt={`Imagen ${currentIndex + 1}`}
          />
        </div>
        <a
          href={`/propiedades/seleccion/${prop.propiedad_id}`}
          style={{ textDecoration: "none" }}
          className="w-[280px] h-[120px] lg:h-[120px] mt-[210px] 2xl:w-[280px] bg-white  absolute lg:mt-[200px] rounded-b-2xl shadow flex flex-col items-center px-2  font-display"
        >
          <p className="text-sm font-bold mt-2 text-[#7B7B7B]">
            {Number(prop.mxn_corriente).toLocaleString("en-US")}MXN
          </p>
          <p className="text-sm md:text-base px-2 text-center w-[250px] font-[500] text-[#7B7B7B]">
            {prop.calle}
          </p>
          <div className="flex text-[#7B7B7B] font-[500] text-[15px]">
            <p className="text-sm md:text-base">
              {prop.tipos?.tipo_nombre || "Tipo"} |{" "}
            </p>
            <p className="text-sm md:text-base">
              {prop.operacion === "1"
                ? "Venta"
                : prop.operacion === "2"
                ? "Renta"
                : "N/A"}{" "}
              |
            </p>
            <p className="text-sm md:text-base">{prop.m2_construccion}m²</p>
          </div>
        </a>
      </div>
    );
  };

  const agregarMarkers = (lista) => {
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    for (const prop of lista) {
      if (!prop.longitud || !prop.latitud) continue;

      const precio = prop.mxn_corriente || 0;

      const el = document.createElement("div");
      el.style.background = "#e63946";
      el.style.color = "#fff";
      el.style.padding = "8px 8px";
      el.style.borderRadius = "100px";
      el.style.fontSize = "14px";
      el.style.fontWeight = "bold";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";
      el.dataset.valorOriginal = precio;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([parseFloat(prop.longitud), parseFloat(prop.latitud)])
        .setPopup(
          new mapboxgl.Popup({ closeButton: true, closeOnClick: true }).setHTML(
            ReactDOMServer.renderToString(
              <PopupContent prop={prop} seleccion={seleccion} />
            )
          )
        )
        .addTo(mapRef.current);

      markersRef.current.push({ marker, prop, el });
    }

    mapRef.current.on("zoom", () => {
      const zoom = mapRef.current.getZoom();
      markersRef.current.forEach(({ el }) => {
        const valor = parseFloat(el.dataset.valorOriginal);
        if (zoom < 10) {
          el.innerText = "";
          el.style.width = "10px";
          el.style.height = "10px";
          el.style.borderRadius = "50%";
          el.style.padding = "0";
        } else {
          el.innerText = `$${abreviarPrecio(valor)}`;
          el.style.width = "auto";
          el.style.height = "auto";
          el.style.borderRadius = "6px";
          el.style.padding = "4px 8px";
        }
      });
    });
  };

  const actualizarVisibles = () => {
    const bounds = mapRef.current.getBounds();
    const visibles = markersRef.current
      .filter(({ prop }) =>
        bounds.contains([parseFloat(prop.longitud), parseFloat(prop.latitud)])
      )
      .map(({ prop }) => prop);
    setPropiedadesVisibles(visibles);
  };

  useEffect(() => {
    const manejarBusqueda = async () => {
      const lugar = busqueda || busquedaHome;
      if (!lugar) return;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          lugar
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      setAutoCompleteHome(data.features);
      if (data.features.length > 0) {
        const feature = data.features[0];
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
      }
    };
    manejarBusqueda();
  }, [manejoBusqueda, busquedaHome]);

  return (
    <>
    <div
            className={`${
              shareModalOpen && "invisible"
            } flex flex-col justify-center items-center fixed z-50 w-full h-full top-0 bg-white/70`}
          >
            <div className="min-h-screen  flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center space-y-2">
                <div className="text-end   ">
                  <FontAwesomeIcon icon={faXmark}  size="2xl" className="cursor-pointer"  onClick={()=> setShareModalOpen(true)}/>
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
                    className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 bg-blueRemax text-white rounded-lg shadow-sm hover:bg-blueRemax/80 transition-colors duration-200"
                    aria-label="Contactar por WhatsApp"
                    onClick={() => {
                      const mensaje = `Estoy interesado en esta propiedad: ${window.location.origin}/propiedades/seleccion/${seleccion}`;
                      const whatsappLink = `https://wa.me/5212292696629?text=${encodeURIComponent(
                        mensaje
                      )}`;
                      window.open(whatsappLink, "_blank");
                    }}
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                    <span className="text-sm sm:text-base md:text-lg">
                      Contactar por WhatsApp
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
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

export default MapboxConCards;
