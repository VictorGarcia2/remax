import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";
const MapboxConCards = ({
  busqueda,
  manejoBusqueda,
  setPropiedadesVisibles,
  propiedades,
  setAutoCompleteHome,
  busquedaHome,
  selectedOptions,
  nuevas,
  setNuevas,
  precioMinimo,
  precioMaximo,
  selectedOptionsTipos,
  selectedOptionsOperacion,
}) => {
  console.log(selectedOptionsTipos)
  const [mapIsReady, setMapIsReady] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapLoadedRef = useRef(false);

  // Aplicar filtros
  useEffect(() => {
    const noHayFiltros =
      selectedOptionsTipos.length === 0 &&
      precioMinimo === 0 &&
      precioMaximo === Infinity &&
      selectedOptionsOperacion.length === 0 &&
      selectedOptions.length === 0;

    if (noHayFiltros) {
      setNuevas(propiedades);
    } else {
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
          tiposSeleccionados.length === 0 ||
          tiposSeleccionados.includes(numero);
        const cumpleOperaciones =
          operacionesSeleccionadas.length === 0 ||
          operacionesSeleccionadas.includes(item.operacion);
        const cumpleSector =
          sectoresSeleccionados.length === 0 ||
          sectoresSeleccionados.includes(item.sector);

        return cumplePrecio && cumpleTipos && cumpleOperaciones && cumpleSector;
      });

      setNuevas(filtered);
    }
  }, [
    selectedOptionsTipos,
    selectedOptionsOperacion,
    selectedOptions,
    propiedades,
    precioMinimo,
    precioMaximo,
    setNuevas,
    busqueda
  ]);

  // Inicializar mapa solo una vez
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
      setMapIsReady(true)

      // Esperamos hasta que nuevas tenga propiedades para agregar
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

  // Cuando cambian las propiedades filtradas
  useEffect(() => {
    if (mapLoadedRef.current && nuevas.length > 0) {
      agregarMarkers(nuevas);
      actualizarVisibles();
    }
  }, [mapIsReady,nuevas]); // NO pongas mapLoadedRef.current como dependencia, porque es una ref


  const abreviarPrecio = (valor) => {
    if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
    if (valor >= 1_000) return `${(valor / 1_000).toFixed(0)}K`;
    return valor.toString();
  };
  
  const agregarMarkers = (lista) => {
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];
  
    for (const prop of lista) {
      if (!prop.longitud || !prop.latitud) continue;
  
      const precio = prop.mxn_corriente || 0;
  
      // Crear elemento HTML personalizado para el marcador
      const el = document.createElement("div");
      el.style.background = "#e63946";
      el.style.color = "#fff";
      el.style.padding = "4px 8px";
      el.style.borderRadius = "6px";
      el.style.fontSize = "14px";
      el.style.fontWeight = "bold";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";
  
      // Guardar el valor original del precio en el elemento
      el.dataset.valorOriginal = precio;
  
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([parseFloat(prop.longitud), parseFloat(prop.latitud)])
        .setPopup(
          new mapboxgl.Popup({ closeButton: true, closeOnClick: true }).setHTML(
            `<div style="font-family: Arial, sans-serif; padding: 10px; text-align: center;">
              <h3 style="margin: 0; font-size: 16px; color: #2a9d8f;">${
                prop.tipos?.tipo_nombre || "Propiedad"
              }</h3>
              <p style="margin: 5px 0; font-size: 14px; color: #264653;">
              ${prop.calle || ""} ${prop.numero_exterior || ""}
              </p>
              <p style="margin: 5px 0; font-size: 14px; font-weight: bold; color: #e76f51;">
              $${precio.toLocaleString("en-US", {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })} MXN
              </p>
            </div>`
          )
        )
        .addTo(mapRef.current);
  
      markersRef.current.push({ marker, prop, el });
    }
  
    // Agregar listener al mapa para cambiar contenido según zoom
    mapRef.current.on("zoom", () => {
      const zoom = mapRef.current.getZoom();
      markersRef.current.forEach(({ el }) => {
        const valor = parseFloat(el.dataset.valorOriginal);
        if (zoom < 12) {
          el.innerText = ""; // Mostrar solo el punto
          el.style.width = "10px";
          el.style.height = "10px";
          el.style.borderRadius = "50%";
          el.style.padding = "0";
          el.style.background = "#e63946";
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

  // Búsqueda (una sola vez)
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

  // Eliminar capa previa si existe
  if (mapRef.current.getLayer("limite-colonia")) {
    mapRef.current.removeLayer("limite-colonia");
  }
  if (mapRef.current.getSource("limite-colonia")) {
    mapRef.current.removeSource("limite-colonia");
  }

  // Verificar si existe un bbox (caja delimitadora)
  if (feature.bbox) {
    const [[minLng, minLat], [maxLng, maxLat]] = [
      [feature.bbox[0], feature.bbox[1]],
      [feature.bbox[2], feature.bbox[3]],
    ];

    // Crear un GeoJSON de un polígono utilizando el bbox
    const geojsonPolygon = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat]
        ]]
      }
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
  }, [ manejoBusqueda,busquedaHome]);

  return (
    <div className="w-full  flex flex-col lg:flex-row gap-4">
      {/* Mapa */}
      <div className="w-full h-[400px] lg:h-[700px] relative">
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%" }}
          className="lg:rounded-xl overflow-hidden"
        />
      </div>
    </div>
  );
};

export default MapboxConCards;
