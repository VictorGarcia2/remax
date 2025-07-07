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
  console.log('Valor de seleccion en GoogleMapsConCards:', seleccion);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDoBmSoAPraNNjNS2NQAu-Vs85trnJuJVI",
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

  if (!isLoaded) return <div className="text-center py-8">Cargando Google Maps...</div>;

  return (
    <div className="w-full h-[400px] lg:h-[700px] relative">
      <GoogleMap
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
              <CustomMarker prop={prop} valor={valor} onClick={() => setSelectedProp(prop)} zoom={zoom} />
            </OverlayView>
          );
        })}
        {selectedProp && (
          <InfoWindow
            position={{ lat: parseFloat(selectedProp.latitud), lng: parseFloat(selectedProp.longitud) }}
            onCloseClick={() => setSelectedProp(null)}
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
  const imagenesArray = (prop.imagenes || '').split(",");
  const [imgIdx, setImgIdx] = useState(0);
  const totalImgs = imagenesArray.length;

  // Detectar breakpoints
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024;

  const goPrev = (e) => {
    e.stopPropagation();
    setImgIdx((idx) => (idx - 1 + totalImgs) % totalImgs);
  };
  const goNext = (e) => {
    e.stopPropagation();
    setImgIdx((idx) => (idx + 1) % totalImgs);
  };

  // Responsive clases
  const containerClass = `flex flex-col justify-center items-center bg-white rounded-xl shadow-lg overflow-hidden animate-fadein
    w-[90vw] max-w-[340px] p-1
    sm:w-[380px] sm:max-w-[380px] sm:p-2
    md:w-80 md:max-w-[420px] md:p-3`;
  const imgClass = `w-full object-cover select-none rounded-t-xl
    h-36
    sm:h-44
    md:h-52`;
  const priceClass = `text-lg font-bold text-gray-800
    sm:text-xl
    md:text-2xl`;
  const buttonClass = `flex-1 text-white text-center py-2 px-3 text-base rounded-lg transition-colors duration-200 font-semibold shadow
    sm:py-2.5 sm:text-lg
    md:py-3 md:text-xl`;
  const whatsappClass = `flex items-center justify-center px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white shadow text-base
    sm:py-2.5 sm:text-lg
    md:py-3 md:text-xl`;
  const navBtnClass = `absolute z-10 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md
    p-2 text-xl
    sm:p-2.5 sm:text-2xl
    md:p-3 md:text-3xl`;
  const imgNavIconSize = isMobile ? 24 : isTablet ? 28 : 32;

  return (
    <div className={containerClass}>
      {/* Imagen principal con navegación si hay varias */}
      <div className="relative w-full">
        {totalImgs > 1 && (
          <button
            onClick={goPrev}
            className={navBtnClass + " left-2 top-1/2 -translate-y-1/2"}
            aria-label="Anterior"
          >
            <svg width={imgNavIconSize} height={imgNavIconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <img
          loading="lazy"
          className={imgClass}
          src={`https://cdn.remax.com.mx/properties/${prop.propiedad_id}/${imagenesArray[imgIdx]}`}
          alt={`Imagen de ${prop.calle}`}
          width="100%"
        />
        {totalImgs > 1 && (
          <button
            onClick={goNext}
            className={navBtnClass + " right-2 top-1/2 -translate-y-1/2"}
            aria-label="Siguiente"
          >
            <svg width={imgNavIconSize} height={imgNavIconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
        {totalImgs > 1 && (
          <span className="absolute bottom-2 right-1/2 translate-x-1/2 bg-black/70 text-white text-xs rounded-full px-2 py-0.5 z-10">
            {imgIdx + 1}/{totalImgs}
          </span>
        )}
      </div>
      {/* Contenido principal */}
      <div className="w-full flex flex-col gap-2 p-2 sm:p-3 md:p-4">
        <div className="flex items-center justify-between">
          <span className={priceClass}>{abreviarPrecio(prop.mxn_corriente)} MXN</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${valor === "comercial" ? "bg-redRemax text-white" : "bg-blueRemax text-white"}`}>{prop.operacion === "1" ? "Venta" : prop.operacion === "2" ? "Renta" : "N/A"}</span>
        </div>
        <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium truncate mb-1">{prop.calle}</div>
        <div className="flex gap-3 text-xs sm:text-sm md:text-base text-gray-500">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{prop.tipos?.tipo_nombre || "Tipo"}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>{prop.m2_construccion}m²</span>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <a
            href={`/propiedades/seleccion/${prop.propiedad_id}`}
            className={buttonClass + ` ${valor === "comercial" ? "bg-redRemax hover:bg-red-700" : "bg-blueRemax hover:bg-blue-700"}`}
          >
            Ver detalles
          </a>
          <a
            href={`https://wa.me/5212292696629?text=${encodeURIComponent(`Estoy interesado en esta propiedad: https://remax.com.mx/propiedades/seleccion/${prop.propiedad_id}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={whatsappClass}
            title="Contactar por WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="22" height="22"><path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12a11.93 11.93 0 0 0 1.64 6.06L0 24l6.22-1.63A12.09 12.09 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.93 9.93 0 0 1-5.13-1.41l-.37-.22-3.69.97.99-3.59-.24-.37A9.93 9.93 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.1-.43-.14-.61.14-.18.28-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default GoogleMapsConCards; 