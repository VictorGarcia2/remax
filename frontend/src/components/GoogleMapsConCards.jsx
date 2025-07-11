import React, { useCallback, useRef, useEffect, useState } from "react";
import { GoogleMap, InfoWindow, OverlayView, useJsApiLoader, Polygon } from "@react-google-maps/api";
import { useSearchContext } from '../context/SearchContext';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 19.172264,
  lng: -96.135744
};

const GOOGLE_MAPS_LIBRARIES = ["places"];

function abreviarPrecio(valor) {
  if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `${(valor / 1_000).toFixed(0)}K`;
  return valor.toString();
}

const CustomMarker = ({ prop, valor, onClick, zoom }) => {
  if (zoom < 12) {
    // Círculo pequeño sin texto
    return (
      <div
        onClick={onClick}
        style={{
          background: valor === "comercial" ? "#e63946" : "#0077ff",
          border: "2px solid white",
          width: 16,
          height: 16,
          borderRadius: "50%",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        className="marker-circle"
      />
    );
  }
  // Píldora con precio
  return (
    <div
      onClick={onClick}
      style={{
        background: valor === "comercial" ? "#e63946" : "#0077ff",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "100px",
        fontSize: "14px",
        fontWeight: "bold",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "80px",
        height: "32px",
        border: "2px solid white"
      }}
      className="marker-pill"
    >
      {`${abreviarPrecio(prop.mxn_corriente)} MXN`}
    </div>
  );
};

// Función para determinar el nivel de zoom según la descripción
function getZoomLevel(description = "") {
  // Dirección exacta: contiene número después de palabra o al inicio
  if (/\b\d+\b/.test(description) || /[a-zA-Z]+\s+\d+/.test(description)) return 17;
  // Calle (sin número explícito)
  if (/calle|av\.|avenida/i.test(description)) return 16;
  // Colonia, barrio, fraccionamiento
  if (/colonia|barrio|fracc|fraccionamiento/i.test(description)) return 15;
  // Municipio, localidad, pueblo, villa
  if (/municipio|localidad|pueblo|villa/i.test(description)) return 15;
  // Ciudad, estado, país
  if (/ciudad|estado|mx|méxico|mexico/i.test(description)) return 11;
  return 13; // Default general
}

// Hook para cargar y filtrar el polígono de Veracruz
function useVeracruzPolygon() {
  const [veracruzCoordsArray, setVeracruzCoordsArray] = useState([]);

  useEffect(() => {
    fetch('/data/mexicoHigh.json')
      .then(res => res.json())
      .then(data => {
        const veracruzFeature = data.features.find(
          f => f.properties.name === 'Veracruz'
        );
        if (veracruzFeature) {
          // Puede ser multipolígono o polígono
          let coordsArray = [];
          if (veracruzFeature.geometry.type === 'MultiPolygon') {
            coordsArray = veracruzFeature.geometry.coordinates.map(
              poly => poly[0].map(coord => ({ lat: coord[1], lng: coord[0] }))
            );
          } else if (veracruzFeature.geometry.type === 'Polygon') {
            coordsArray = [veracruzFeature.geometry.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }))];
          }
          setVeracruzCoordsArray(coordsArray);
        }
      });
  }, []);

  return veracruzCoordsArray;
}

const GoogleMapsConCards = ({
  propiedades = [],
  setPropiedadesVisibles = () => {},
  valor
}) => {
  const [selectedProp, setSelectedProp] = useState(null);
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(11);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const { seleccion } = useSearchContext();
  const [pendingCenter, setPendingCenter] = useState(null);
  const [mapError, setMapError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  console.log('Valor de seleccion en GoogleMapsConCards:', seleccion);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "AIzaSyDoBmSoAPraNNjNS2NQAu-Vs85trnJuJVI",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const veracruzCoordsArray = useVeracruzPolygon();

  // Actualizar propiedades visibles según el bounds del mapa
  const onBoundsChanged = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;
    const visibles = propiedades.filter((prop) => {
      if (!prop.latitud || !prop.longitud) return false;
      const pos = { lat: parseFloat(prop.latitud), lng: parseFloat(prop.longitud) };
      return bounds.contains(pos);
    });
    setPropiedadesVisibles(visibles);
    setZoom(mapRef.current.getZoom());
  }, [propiedades, setPropiedadesVisibles]);

  useEffect(() => {
    if (mapRef.current) onBoundsChanged();
    // eslint-disable-next-line
  }, [propiedades]);

  useEffect(() => {
    if (
      isLoaded &&
      mapRef.current &&
      seleccion &&
      typeof seleccion.lat === 'number' &&
      typeof seleccion.lng === 'number'
    ) {
      const zoomLevel = getZoomLevel(seleccion.description);
      console.log('Google Maps centrando en:', seleccion.lat, seleccion.lng, 'Zoom:', zoomLevel);
      mapRef.current.panTo({ lat: seleccion.lat, lng: seleccion.lng });
      mapRef.current.setZoom(zoomLevel);
      setMapCenter({ lat: seleccion.lat, lng: seleccion.lng });
      setPendingCenter(null);
    } else if (seleccion && typeof seleccion.lat === 'number' && typeof seleccion.lng === 'number') {
      setPendingCenter({ lat: seleccion.lat, lng: seleccion.lng });
    }
  }, [isLoaded, seleccion?.lat, seleccion?.lng, seleccion?.description]);

  useEffect(() => {
    if (loadError) setMapError(true);
  }, [loadError]);

  if (mapError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
        <span className="text-red-600 font-bold text-lg">Error al cargar Google Maps</span>
        <span className="text-gray-500">Verifica tu conexión o la clave de API.</span>
        <button className="bg-blueRemax text-white px-4 py-2 rounded" onClick={() => { setMapError(false); setRetryKey(retryKey+1); window.location.reload(); }}>Reintentar</button>
      </div>
    );
  }
  if (!isLoaded) return <div className="text-center py-8">Cargando Google Maps...</div>;

  return (
    <div className="w-full h-[650px] lg:h-[700px] relative" role="region" aria-label="Mapa de propiedades">
      <GoogleMap
        key={retryKey}
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={11}
        onLoad={map => {
          mapRef.current = map;
          onBoundsChanged();
          if (
            pendingCenter &&
            typeof pendingCenter.lat === 'number' &&
            typeof pendingCenter.lng === 'number'
          ) {
            const zoomLevel = getZoomLevel(seleccion && seleccion.description);
            map.panTo(pendingCenter);
            map.setZoom(zoomLevel);
            setMapCenter(pendingCenter);
            setPendingCenter(null);
          }
        }}
        onBoundsChanged={onBoundsChanged}
        options={{
          maxZoom: 18,
          minZoom: 5,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {/* Dibuja el polígono de Veracruz */}
        {/*
        {veracruzCoordsArray.map((poly, idx) => (
          <Polygon
            key={idx}
            paths={poly}
            options={{
              fillColor: "#FFA500",
              fillOpacity: 0.2,
              strokeColor: "#FF6600",
              strokeOpacity: 0.8,
              strokeWeight: 3,
            }}
          />
        ))}
        */}
        {propiedades.map((prop) => {
          if (!prop.latitud || !prop.longitud) return null;
          const pos = { lat: parseFloat(prop.latitud), lng: parseFloat(prop.longitud) };
          return (
            <OverlayView
              key={prop.propiedad_id}
              position={pos}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div role="button" aria-label={`Ver detalles de la propiedad en ${prop.calle || 'ubicación desconocida'}`}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedProp(prop); }}
                style={{ outline: 'none' }}
              >
                <CustomMarker prop={prop} valor={valor} onClick={() => setSelectedProp(prop)} zoom={zoom} />
              </div>
            </OverlayView>
          );
        })}
        {selectedProp && (
          <InfoWindow
            position={{ lat: parseFloat(selectedProp.latitud), lng: parseFloat(selectedProp.longitud) }}
            onCloseClick={() => setSelectedProp(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -10) }}
          >
            <PopupUX
              prop={selectedProp}
              valor={valor}
            />
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

function PopupUX({ prop, valor }) {
  const imagenesArray = (prop.imagenes || '').split(",").filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);
  const totalImgs = imagenesArray.length;
  const [imgError, setImgError] = useState(false);

  // Animación de entrada
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  // Clases responsivas y equilibradas para todos los dispositivos
  const containerClass = `flex flex-col bg-white/95 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadein
    w-auto max-w-[92vw] min-w-[140px] p-1
    sm:max-w-[340px] sm:p-3
    md:max-w-[420px] md:p-6
    transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`;
  const imgClass = `w-[250px] md:w-[360px]	 object-cover select-none rounded-t-2xl h-32
    sm:h-32
    md:h-48 transition-all duration-300`;
  const priceClass = `text-xs font-bold text-gray-800 tracking-wide
    sm:text-sm
    md:text-base`;
  const buttonClass = `w-full text-white text-center py-2 px-2 text-xs rounded-xl transition-all duration-200 font-semibold shadow-lg bg-blueRemax hover:bg-blue-700 active:scale-95
    sm:py-2.5 sm:text-sm
    md:py-3 md:text-base`;
  const navBtnClass = `absolute z-10 bg-white/90 hover:bg-blue-100 active:bg-blue-200 text-gray-700 rounded-full shadow-md
    p-1 text-xs transition-all duration-150
    sm:p-2 sm:text-base
    md:p-3 md:text-lg`;
  const closeBtnClass = `absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-blue-100 active:bg-blue-200 cursor-pointer z-20 text-base transition-all duration-150
    sm:top-3 sm:right-3 sm:p-3 sm:text-lg
    md:top-4 md:right-4 md:p-4 md:text-xl`;
  const infoTextClass = `text-xs text-gray-700 font-medium truncate break-words overflow-hidden leading-tight
    sm:text-sm
    md:text-base`;
  const labelClass = `text-xs font-semibold px-2 py-0.5 rounded bg-blueRemax/90 text-white break-words overflow-hidden shadow-sm
    sm:text-sm sm:px-3
    md:text-base md:px-4`;
  const iconClass = `h-4 w-4
    sm:h-5 sm:w-5
    md:h-6 md:w-6`;

  const goPrev = (e) => {
    e.stopPropagation();
    setImgIdx((idx) => (idx - 1 + totalImgs) % totalImgs);
    setImgError(false);
  };
  const goNext = (e) => {
    e.stopPropagation();
    setImgIdx((idx) => (idx + 1) % totalImgs);
    setImgError(false);
  };

  // Determina el tipo de operación y el color de la etiqueta
  const esVenta = prop.operacion === "1";
  const esRenta = prop.operacion === "2";
  const operacionLabel = esVenta ? "Venta" : esRenta ? "Renta" : "N/A";
  const operacionColor = esVenta ? "bg-blueRemax" : esRenta ? "bg-green-500" : "bg-gray-400";

  return (
    <div className={containerClass} style={{maxHeight: '90vh', overflowY: 'auto'}} role="dialog" aria-modal="true" aria-label="Información de propiedad">
      {/* Botón de cierre único y accesible en la esquina superior derecha */}
    
      <div className="relative w-full">
        {totalImgs > 1 && (
          <>
            <button className={navBtnClass + ' left-1 top-1/2 -translate-y-1/2'} aria-label="Imagen anterior" onClick={goPrev}>&lt;</button>
            <button className={navBtnClass + ' right-1 top-1/2 -translate-y-1/2'} aria-label="Imagen siguiente" onClick={goNext}>&gt;</button>
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs rounded px-1 py-0.5 sm:text-sm md:text-base shadow-md">{imgIdx+1}/{totalImgs}</span>
          </>
        )}
        {imgError || !imagenesArray[imgIdx] ? (
          <div className="w-full h-20 sm:h-32 md:h-48 flex items-center justify-center bg-gray-00 text-gray-500 text-xs sm:text-sm md:text-base rounded-t-2xl">Imagen no disponible</div>
        ) : (
          <img
            loading="lazy"
            className={imgClass}
            src={`https://cdn.remax.com.mx/properties/${prop.propiedad_id}/${imagenesArray[imgIdx]}`}
            alt={`Imagen de ${prop.calle}`}
            width="100%"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="w-full flex flex-col gap-1 p-1 sm:gap-2 sm:p-3 md:gap-4 md:p-6">
        <div className="flex items-center justify-between">
          <span className={priceClass}>{abreviarPrecio(prop.mxn_corriente)} MXN</span>
          <span className={`${labelClass} ${operacionColor}`}>{operacionLabel}</span>
        </div>
        <div className={infoTextClass + " break-words overflow-hidden"}>{prop.calle}</div>
        <div className="flex gap-1 sm:gap-2 md:gap-3 text-xs text-gray-500 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className={infoTextClass + " break-words overflow-hidden"}>{prop.tipos?.tipo_nombre || "Tipo"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className={infoTextClass + " break-words overflow-hidden"}>{prop.m2_construccion}m²</span>
        </div>
        <a
          href={`/propiedades/seleccion/${prop.propiedad_id}`}
          className={buttonClass}
        >
          Ver detalles
        </a>
      </div>
    </div>
  );
}

export default GoogleMapsConCards; 