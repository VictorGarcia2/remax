import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../config/googleMaps';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const GoogleMapaPropiedades = ({
  propiedades,
  setPropiedadesVisibles,
  valor
}) => {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  const [map, setMap] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [hoveredProperty, setHoveredProperty] = useState(null);

  // Filtrar propiedades con coordenadas válidas
  const propiedadesConCoordenadas = useMemo(() => {
    return propiedades.filter(
      prop => prop.latitud && prop.longitud && 
      !isNaN(parseFloat(prop.latitud)) && 
      !isNaN(parseFloat(prop.longitud))
    );
  }, [propiedades]);

  // Calcular el centro del mapa basado en las propiedades
  const center = useMemo(() => {
    if (propiedadesConCoordenadas.length === 0) {
      return DEFAULT_CENTER;
    }

    const sumLat = propiedadesConCoordenadas.reduce((sum, prop) => sum + parseFloat(prop.latitud), 0);
    const sumLng = propiedadesConCoordenadas.reduce((sum, prop) => sum + parseFloat(prop.longitud), 0);

    return {
      lat: sumLat / propiedadesConCoordenadas.length,
      lng: sumLng / propiedadesConCoordenadas.length
    };
  }, [propiedadesConCoordenadas]);

  const onLoad = useCallback((map) => {
    setMap(map);
    
    // Ajustar el zoom para mostrar todas las propiedades
    if (propiedadesConCoordenadas.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      propiedadesConCoordenadas.forEach(prop => {
        bounds.extend({
          lat: parseFloat(prop.latitud),
          lng: parseFloat(prop.longitud)
        });
      });
      map.fitBounds(bounds);
    }
  }, [propiedadesConCoordenadas]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Actualizar propiedades visibles cuando el mapa se mueve
  const onBoundsChanged = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const visible = propiedadesConCoordenadas.filter(prop => {
      const position = new window.google.maps.LatLng(
        parseFloat(prop.latitud),
        parseFloat(prop.longitud)
      );
      return bounds.contains(position);
    });

    setPropiedadesVisibles(visible);
  }, [map, propiedadesConCoordenadas, setPropiedadesVisibles]);

  // Función para abreviar el precio
  const abreviarPrecio = (valor) => {
    if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
    if (valor >= 1_000) return `${(valor / 1_000).toFixed(0)}K`;
    return valor.toString();
  };

  // Icono personalizado del marcador según el sector
  const getMarkerIcon = (prop) => {
    const color = valor === "comercial" ? "#e63946" : "#0077ff";
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#ffffff"
    };
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blueRemax mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={DEFAULT_ZOOM}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
      onBoundsChanged={onBoundsChanged}
      onIdle={onBoundsChanged}
    >
      {propiedadesConCoordenadas.map((prop) => (
        <Marker
          key={prop.propiedad_id}
          position={{
            lat: parseFloat(prop.latitud),
            lng: parseFloat(prop.longitud)
          }}
          icon={getMarkerIcon(prop)}
          onClick={() => setSelectedProperty(prop)}
          onMouseOver={() => setHoveredProperty(prop)}
          onMouseOut={() => setHoveredProperty(null)}
          label={
            hoveredProperty?.propiedad_id === prop.propiedad_id
              ? {
                  text: `$${abreviarPrecio(prop.mxn_corriente)}`,
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  className: "marker-label"
                }
              : undefined
          }
        />
      ))}

      {selectedProperty && (
        <InfoWindow
          position={{
            lat: parseFloat(selectedProperty.latitud),
            lng: parseFloat(selectedProperty.longitud)
          }}
          onCloseClick={() => setSelectedProperty(null)}
        >
          <div className="w-64 md:w-[300px] p-2">
            {/* Imagen de la propiedad */}
            <div className="relative w-full mb-3">
              <img
                loading="lazy"
                className="w-full h-40 object-cover rounded-lg"
                src={`https://cdn.remax.com.mx/properties/${selectedProperty.propiedad_id}/${selectedProperty.imagenes?.split(',')[0]}`}
                alt={selectedProperty.titulo || selectedProperty.calle}
              />
              <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-semibold text-white ${
                valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
              }`}>
                {selectedProperty.operacion === "1" ? "Venta" : selectedProperty.operacion === "2" ? "Renta" : "N/A"}
              </div>
            </div>

            {/* Información */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800">
                ${abreviarPrecio(selectedProperty.mxn_corriente)} MXN
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-2">
                {selectedProperty.calle}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{selectedProperty.tipos?.tipo_nombre || "Tipo"}</span>
                </div>
                {selectedProperty.m2_construccion && (
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>{selectedProperty.m2_construccion}m²</span>
                  </div>
                )}
              </div>

              {/* Botón */}
              <a
                href={`/propiedades/seleccion/${selectedProperty.propiedad_id}`}
                className={`w-full text-white text-center py-2 px-4 text-sm rounded-lg transition-colors duration-200 block mt-3 ${
                  valor === "comercial" ? "bg-redRemax hover:bg-red-700" : "bg-blueRemax hover:bg-blue-700"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                Ver detalles
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default React.memo(GoogleMapaPropiedades);
