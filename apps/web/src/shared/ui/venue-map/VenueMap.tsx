import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import { config } from '@/shared/config';
import { MapFrame } from './styles';

export type MapPoint = { latitude: number; longitude: number };

export type VenueMapProps = {
  /** Where the pin is; without one the map shows `center` and no pin. */
  location: MapPoint | null;
  /** What to show when there is no pin, e.g. the event's city. */
  center?: MapPoint | null;
  /**
   * Makes the map editable: the pin can be dragged and a click on the map
   * moves it there. Called with the new position.
   */
  onChange?: (location: MapPoint) => void;
  /** Accessible name of the map, e.g. "Map of WeWork Guindy". */
  label: string;
  /** Height in px. */
  height?: number;
};

/** Centre of India, for a form that has neither a pin nor a city yet. */
const FALLBACK_CENTER: MapPoint = { latitude: 22.5, longitude: 79 };
const PIN_ZOOM = 15;
const CITY_ZOOM = 11;
const COUNTRY_ZOOM = 4;

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Drawn with CSS (see styles), so no marker image has to be bundled. */
const pinIcon = L.divIcon({
  className: 'venue-map-pin',
  html: '<span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

const toLatLng = ({ latitude, longitude }: MapPoint): L.LatLngTuple => [
  latitude,
  longitude
];
const fromLatLng = ({ lat, lng }: L.LatLng): MapPoint => ({
  latitude: Number(lat.toFixed(6)),
  longitude: Number(lng.toFixed(6))
});
const samePoint = (a: MapPoint | null, b: MapPoint | null) =>
  a !== null &&
  b !== null &&
  a.latitude === b.latitude &&
  a.longitude === b.longitude;

/**
 * OpenStreetMap map (Leaflet) with an optional venue pin. Read-only on the
 * event page; editable on the event form when `onChange` is given.
 * Scroll-wheel zoom is off so the page still scrolls over the map.
 */
export const VenueMap = ({
  location,
  center = null,
  onChange,
  label,
  height = 280
}: VenueMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  // The last position the map itself reported, so it doesn't re-centre
  // under the organizer's hand after a drag or click.
  const emittedRef = useRef<MapPoint | null>(null);
  // What the view was last centred on, so a re-render with equal (but new)
  // objects doesn't move the map.
  const viewRef = useRef('');
  const editable = Boolean(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Create the map once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    const map = L.map(container, { scrollWheelZoom: false });
    L.tileLayer(config.mapTileUrl, {
      attribution: ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);
    map.on('click', (event: L.LeafletMouseEvent) => {
      const point = fromLatLng(event.latlng);
      if (onChangeRef.current) {
        emittedRef.current = point;
        onChangeRef.current(point);
      }
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      viewRef.current = '';
    };
  }, []);

  // Keep the pin and the view in step with the props.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const viewKey = (point: MapPoint, zoom: number) =>
      `${point.latitude},${point.longitude},${zoom}`;
    const showView = (point: MapPoint, zoom: number) => {
      const key = viewKey(point, zoom);
      if (key !== viewRef.current) {
        viewRef.current = key;
        map.setView(toLatLng(point), zoom);
      }
    };
    if (!location) {
      markerRef.current?.remove();
      markerRef.current = null;
      showView(center ?? FALLBACK_CENTER, center ? CITY_ZOOM : COUNTRY_ZOOM);
      return;
    }
    if (!markerRef.current) {
      const marker = L.marker(toLatLng(location), {
        icon: pinIcon,
        draggable: editable,
        keyboard: false,
        title: label
      }).addTo(map);
      marker.on('dragend', () => {
        const point = fromLatLng(marker.getLatLng());
        emittedRef.current = point;
        onChangeRef.current?.(point);
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(toLatLng(location));
    }
    if (samePoint(location, emittedRef.current)) {
      // Moved on the map itself: leave the view where the organizer has it.
      viewRef.current = viewKey(location, PIN_ZOOM);
    } else {
      showView(location, PIN_ZOOM);
    }
    emittedRef.current = null;
  }, [location, center, editable, label]);

  return (
    <MapFrame
      ref={containerRef}
      role="region"
      aria-label={label}
      $height={height}
      $editable={editable}
    />
  );
};

/** Directions to the pin in the visitor's maps app (no API key). */
export const directionsUrl = ({ latitude, longitude }: MapPoint) =>
  `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
