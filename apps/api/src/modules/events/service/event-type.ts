import type { UpdateEventInput } from '../schemas';
import { VENUE_PIN_REQUIRED } from '../schemas/messages';
import type { EventRow, EventType, VenueLocation } from '../types';
import { CITY_REQUIRED, fieldErrors } from './errors';

/** Online-only events don't need a venue; store a readable placeholder. */
export const venueFor = (eventType: EventType, venue: string) =>
  venue === '' && eventType === 'ONLINE' ? 'Online' : venue;

/** The stored venue pin, or null. */
const venueLocationOf = (event: EventRow): VenueLocation | null =>
  event.venue_latitude === null || event.venue_longitude === null
    ? null
    : { latitude: event.venue_latitude, longitude: event.venue_longitude };

/** Write fields for a pin; online events never keep one. */
export const venueLocationFields = (
  eventType: EventType,
  location: VenueLocation | null | undefined
) => {
  const pin = eventType === 'ONLINE' ? null : (location ?? null);
  return {
    venueLatitude: pin?.latitude ?? null,
    venueLongitude: pin?.longitude ?? null
  };
};

/**
 * Checks venue / meeting link / map pin against the event type after the
 * update. A published in-person or hybrid event can't lose its pin (older
 * events without one can still be edited, as long as the edit doesn't touch
 * the type or the pin).
 */
export const resolveTypeFields = (event: EventRow, input: UpdateEventInput) => {
  const eventType = input.eventType ?? event.event_type;
  const onlineUrl =
    input.onlineUrl === undefined ? event.online_url : input.onlineUrl;
  const venue = input.venue ?? event.venue;
  const cityId = input.cityId === undefined ? event.city?.id : input.cityId;
  const location =
    input.venueLocation === undefined
      ? venueLocationOf(event)
      : input.venueLocation;
  const touchesPin =
    input.eventType !== undefined || input.venueLocation !== undefined;

  if (eventType !== 'ONLINE' && venue === '') {
    throw fieldErrors({ venue: 'Venue is required.' });
  }
  if (eventType !== 'ONLINE' && !cityId) {
    throw fieldErrors({ cityId: CITY_REQUIRED });
  }
  if (
    touchesPin &&
    event.status === 'PUBLISHED' &&
    eventType !== 'ONLINE' &&
    !location
  ) {
    throw fieldErrors({ venueLocation: VENUE_PIN_REQUIRED });
  }
  if (eventType !== 'IN_PERSON' && !onlineUrl) {
    throw fieldErrors({
      onlineUrl: 'Meeting link is required for online and hybrid events.'
    });
  }
  // Changing the type or the link rewrites the stored link; in-person
  // events don't keep one.
  let nextOnlineUrl: string | null | undefined;
  if (input.eventType !== undefined || input.onlineUrl !== undefined) {
    nextOnlineUrl = eventType === 'IN_PERSON' ? null : onlineUrl;
  }
  // Online events drop their city; otherwise keep or change it.
  let nextCityId: string | null | undefined;
  if (input.eventType !== undefined || input.cityId !== undefined) {
    nextCityId = eventType === 'ONLINE' ? null : (cityId ?? null);
  }
  return {
    ...(touchesPin ? venueLocationFields(eventType, location) : {}),
    eventType: input.eventType,
    cityId: nextCityId,
    venue: input.venue === undefined ? undefined : venueFor(eventType, venue),
    onlineUrl: nextOnlineUrl
  };
};
