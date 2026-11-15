import type { City } from '@/shared/api/types';

export type Coordinates = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance in km (haversine), same formula as the API. */
const distanceKm = (from: Coordinates, to: Coordinates): number => {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

/** Beyond this, we'd rather ask than guess the wrong city. */
export const MAX_NEAREST_CITY_KM = 150;

/**
 * The supported city closest to a position, if one is within `maxKm`.
 * Runs in the browser, so the visitor's exact position never leaves it.
 */
export const nearestCity = (
  cities: City[],
  position: Coordinates,
  maxKm = MAX_NEAREST_CITY_KM
): { city: City; distanceKm: number } | null => {
  let best: { city: City; distanceKm: number } | null = null;
  for (const city of cities) {
    const km = distanceKm(position, city);
    if (!best || km < best.distanceKm) {
      best = { city, distanceKm: km };
    }
  }
  return best && best.distanceKm <= maxKm ? best : null;
};

/** Lower-case, accent-free text for forgiving matching ("Bengalūru"). */
const fold = (text: string) =>
  text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/**
 * Cities matching a search, best first: name prefix, then alias or state
 * prefix, then anywhere in the name or an alias ("bombay" → Mumbai).
 */
export const searchCities = (cities: City[], query: string): City[] => {
  const q = fold(query);
  if (!q) {
    return cities;
  }
  const score = (city: City) => {
    const name = fold(city.name);
    const aliases = city.aliases.map(fold);
    if (name.startsWith(q)) return 0;
    if (aliases.some((alias) => alias.startsWith(q))) return 1;
    if (fold(city.state).startsWith(q)) return 2;
    if (name.includes(q) || aliases.some((alias) => alias.includes(q))) {
      return 3;
    }
    return -1;
  };
  return cities
    .map((city) => ({ city, rank: score(city) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.city.name.localeCompare(b.city.name))
    .map(({ city }) => city);
};

/** "290 km away", or nothing for the same city / unknown distance. */
export const formatDistance = (km: number | null): string | null =>
  km === null || km < 1
    ? null
    : `${Math.round(km).toLocaleString('en-IN')} km away`;
