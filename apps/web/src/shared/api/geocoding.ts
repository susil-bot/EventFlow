import { config } from '@/shared/config';
import type { VenueLocation } from './types';

/** A place found by the address search. */
export type PlaceResult = {
  id: string;
  /** Full address, e.g. "Tidel Park, Rajiv Gandhi Salai, Taramani, Chennai…". */
  label: string;
  location: VenueLocation;
};

type NominatimPlace = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

/**
 * Looks up an address with OpenStreetMap's Nominatim (no API key). Only
 * the typed query is sent. Nominatim's policy allows at most one search a
 * second and no search-as-you-type, so callers search on an explicit
 * action. Limited to India, where all EventFlow cities are.
 */
export const searchPlaces = async (
  query: string,
  signal?: AbortSignal
): Promise<PlaceResult[]> => {
  const url = new URL(config.geocoderUrl, window.location.origin);
  url.search = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '5',
    countrycodes: 'in',
    'accept-language': 'en'
  }).toString();
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) {
    throw new Error(
      `Address search is unavailable right now (${response.status}). Please try again, or place the pin on the map.`
    );
  }
  const places = (await response.json()) as NominatimPlace[];
  return places.flatMap((place) => {
    const latitude = Number(place.lat);
    const longitude = Number(place.lon);
    return Number.isFinite(latitude) && Number.isFinite(longitude)
      ? [
          {
            id: String(place.place_id),
            label: place.display_name,
            location: { latitude, longitude }
          }
        ]
      : [];
  });
};
