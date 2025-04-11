import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
mapboxgl.accessToken =
  "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";

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
  aplicarFiltros,
  selectedOptionsTipos,
  selectedOptionsOperacion,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
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
        const cumpleTipos =
          tiposSeleccionados.length === 0 ||
          tiposSeleccionados.includes(item.tipos?.tipo_id);
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
    precioMaximo
  ]);
  

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-96.135744, 19.172264], // Veracruz
      zoom: 11,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl());
    mapRef.current.on("load", () => {
      agregarMarkers(nuevas);
      actualizarVisibles();
    });
    mapRef.current.on("moveend", () => {
      actualizarVisibles();
    });

    return () => mapRef.current.remove();
  }, []); 


  useEffect(() => {
    if (mapRef.current && nuevas.length > 0) {
      agregarMarkers(nuevas);
      actualizarVisibles();
    }
  }, [mapRef.current, nuevas]);
  

  const agregarMarkers = async (lista) => {
    // Limpiar marcadores existentes
    markersRef.current.forEach((m) => m.marker.remove());
    markersRef.current = [];

    for (const prop of lista) {
      // Verificar si existen las coordenadas (usando las llaves correctas)
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
      .filter(({ marker, prop }) =>
        bounds.contains([prop.longitud, prop.latitud])
      )
      .map(({ prop }) => prop);
    setPropiedadesVisibles(visibles);
  };

  useEffect(() => {
    const manejarBusqueda = async () => {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          busqueda
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      setAutoCompleteHome(data.features);
    };
    manejarBusqueda();
  }, [busqueda]);

  useEffect(() => {
    const manejarBusqueda = async () => {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          busqueda || busquedaHome
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features.length > 0) {
        const [longitud, latitud] = data.features[0].center;
        mapRef.current.flyTo({ center: [longitud, latitud], zoom: 13 });
      }
    };
    manejarBusqueda();
  }, [manejoBusqueda]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4">
      {/* Mapa */}
      <div className="w-full h-[700px] relative">
        {/*  {  <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow">
          <input
            className="border px-2 py-1"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar municipio o calle"
          />
          <button onClick={manejarBusqueda} className="ml-2 px-2 py-1 bg-blue-600 text-white rounded">
            Buscar
          </button>
        </div>} */}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Cards */}
      {/*  <div className="w-full lg:w-1/3 max-h-[700px] overflow-y-auto p-2 bg-gray-50 rounded">
        <h2 className="text-xl font-semibold mb-2">Propiedades visibles</h2>
        {propiedadesVisibles.length === 0 ? (
          <p>No hay propiedades en esta zona 😥</p>
        ) : (
          propiedadesVisibles.map((prop, index) => (
            <div key={index} className="bg-white shadow p-4 mb-4 rounded border">
              <h3 className="font-bold text-lg text-gray-800">{prop.tipoPropiedad}</h3>
              <p className="text-sm text-gray-600 mb-1">{prop.direccion}</p>
              <p className="text-green-700 font-semibold">${prop.precio.toLocaleString()}</p>
              <p className="text-xs mt-2">{prop.descripcion}</p>
            </div>
          ))
        )}
      </div> */}
    </div>
  );
};

export default MapboxConCards;
