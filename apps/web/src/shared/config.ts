/** The only place the web app reads build-time environment variables. */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  /** Map tiles (OpenStreetMap by default; no API key). */
  mapTileUrl:
    import.meta.env.VITE_MAP_TILE_URL ??
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  /** Address search for the venue pin (Nominatim by default; no API key). */
  geocoderUrl:
    import.meta.env.VITE_GEOCODER_URL ??
    'https://nominatim.openstreetmap.org/search'
} as const;
