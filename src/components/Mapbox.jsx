import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Tu array de propiedades
export const propiedadess = [
  {
    direccion: "Av. Gregorio Méndez 123, Villahermosa, Tabasco",
    tipoPropiedad: "Casa",
    precio: 1500000,
    descripcion: "Casa amplia con jardín y cochera.",
    latitud: 17.9949,
    longitud: -92.9273,
  },
  {
    direccion: "Calle Reforma 456, Cárdenas, Tabasco",
    tipoPropiedad: "Departamento",
    precio: 850000,
    descripcion: "Departamento céntrico cerca de todo.",
    lat: 18.0033,
    lng: -93.3791,
  },
  {
    direccion: "Calle 27, Centro, Villahermosa, Tabasco",
    tipoPropiedad: "Terreno",
    precio: 500000,
    descripcion: "Terreno plano listo para construir.",
    lat: 17.9894,
    lng: -92.9331,
  },
];

mapboxgl.accessToken =
  "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";

const MapboxConCards = ({
  busqueda,
  manejoBusqueda,
  setPropiedadesVisibles,
  propiedades,
  setAutoCompleteHome,
  busquedaHome,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-92.912, 17.989], // Villahermosa
      zoom: 11,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl());

    mapRef.current.on("load", () => {
      agregarMarkers(propiedades);
      actualizarVisibles();
    });

    mapRef.current.on("moveend", () => {
      actualizarVisibles();
    });

    return () => mapRef.current.remove();
  }, [manejoBusqueda])

  const agregarMarkers = async (lista) => {
    // Limpiar marcadores existentes
    markersRef.current.forEach((m) => m.marker.remove());
    markersRef.current = [];

    for (const prop of lista) {

      // Verificar si existen las coordenadas (usando las llaves correctas)
      if (!prop.longitud || !prop.latitud) continue;

      const marker = new mapboxgl.Marker({ color: "#e63946" })
        // Usar longitud primero (lng) y luego latitud (lat) - formato [lng, lat]
        .setLngLat([parseFloat(prop.longitud), parseFloat(prop.latitud)])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>${prop.tipos?.tipo_nombre || "Propiedad"}</strong><br/>
             <small>${prop.calle || ""} ${
              prop.numero_exterior || ""
            }</small><br/>
             <strong>$${prop.mxn_corriente || "0"}</strong>`
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
          busqueda
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
