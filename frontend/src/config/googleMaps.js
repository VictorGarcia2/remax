// Configuración de Google Maps API
export const GOOGLE_MAPS_CONFIG = {
  id: "google-map-script", // ID único para evitar conflictos
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ["places", "geometry", "drawing"],
  language: "es",
  region: "MX"
};

export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
};

// Centro de Veracruz
export const DEFAULT_CENTER = {
  lat: 19.1738,
  lng: -96.1342
};

export const DEFAULT_ZOOM = 12;
