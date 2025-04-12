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
  console.log("operacion", selectedOptionsOperacion);
  console.log("tipos", selectedOptionsTipos);
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
      console.log(tiposSeleccionados);
      console.log(sectoresSeleccionados);
      console.log(operacionesSeleccionadas);

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
  console.log("estas son las nuevas", nuevas);
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
  const agregarMarkers = (lista) => {
    // Eliminar marcadores antiguos
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    for (const prop of lista) {
      if (!prop.longitud || !prop.latitud) continue;

      const marker = new mapboxgl.Marker({ color: "#e63946" })
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
              $${prop.mxn_corriente?.toLocaleString() || "0"}
              </p>
            </div>`
          )
        )
        .addTo(mapRef.current);

      markersRef.current.push({ marker, prop });
    }
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
        const [longitud, latitud] = data.features[0].center;
        mapRef.current.flyTo({ center: [longitud, latitud], zoom: 13 });
      }
    };
    manejarBusqueda();
  }, [ manejoBusqueda,busquedaHome]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4">
      {/* Mapa */}
      <div className="w-full h-[700px] relative">
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%" }}
          className="rounded-xl overflow-hidden"
        />
      </div>
    </div>
  );
};

export default MapboxConCards;
