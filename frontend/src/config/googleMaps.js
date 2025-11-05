// Configuración de Google Maps API
export const GOOGLE_MAPS_CONFIG = {
  id: "google-map-script", // ID único para evitar conflictos
  googleMapsApiKey: "AIzaSyBvNfyPiw50Y94B5rN-I_tUwdWz7iR_i8M",
  libraries: ["places", "geometry", "drawing"],
  language: "es",
  region: "MX"
};

export const MAPBOX_CONFIG = {
  accessToken: "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg"
};

// Centro de Veracruz
export const DEFAULT_CENTER = {
  lat: 19.1738,
  lng: -96.1342
};

export const DEFAULT_ZOOM = 12;
