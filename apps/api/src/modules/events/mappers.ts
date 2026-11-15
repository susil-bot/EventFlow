import { toUploadUrl } from '../uploads/urls';
import { toLocalDateTime } from './time';
import type {
  AttendeeDto,
  AttendeeRow,
  EventDto,
  EventPhase,
  EventRow,
  EventSlotDto,
  EventSlotJson
} from './types';

export type EventDtoOptions = {
  /** Include the meeting link (owner, or an attendee holding a place). */
  includeOnlineUrl?: boolean;
  /**
   * Include what only the organizer and admins see: go-live and expiry
   * times, and who last edited the event.
   */
  includeStaffFields?: boolean;
};

/** The event's phase at `now` (see `EventPhase`). */
export const phaseOf = (row: EventRow, now: Date): EventPhase => {
  if (row.status === 'DRAFT' || row.status === 'CANCELED') {
    return row.status;
  }
  if (row.starts_at.getTime() <= now.getTime()) {
    return 'ENDED';
  }
  if (row.publish_at && row.publish_at.getTime() > now.getTime()) {
    return 'SCHEDULED';
  }
  if (row.expires_at && row.expires_at.getTime() <= now.getTime()) {
    return 'EXPIRED';
  }
  return 'LIVE';
};

const instant = (value: Date | null, zone: string, show: boolean) =>
  show && value
    ? { iso: value.toISOString(), local: toLocalDateTime(value, zone) }
    : { iso: null, local: null };

const toSlotDto = (
  slot: EventSlotJson,
  zone: string,
  now: Date
): EventSlotDto => {
  const startsAt = new Date(slot.startsAt);
  const endsAt = new Date(slot.endsAt);
  return {
    id: slot.id,
    label: slot.label,
    startsAt: startsAt.toISOString(),
    startsAtLocal: toLocalDateTime(startsAt, zone),
    endsAt: endsAt.toISOString(),
    endsAtLocal: toLocalDateTime(endsAt, zone),
    capacity: slot.capacity,
    registeredCount: slot.registeredCount,
    availablePlaces: Math.max(slot.capacity - slot.registeredCount, 0),
    hasStarted: startsAt.getTime() <= now.getTime()
  };
};

export const toEventDto = (
  row: EventRow,
  now = new Date(),
  { includeOnlineUrl = false, includeStaffFields = false }: EventDtoOptions = {}
): EventDto => {
  const hasStarted = row.starts_at.getTime() <= now.getTime();
  const availablePlaces = Math.max(row.capacity - row.registered_count, 0);
  const phase = phaseOf(row, now);
  const publishAt = instant(row.publish_at, row.time_zone, includeStaffFields);
  const expiresAt = instant(row.expires_at, row.time_zone, includeStaffFields);

  return {
    id: row.id,
    organizerId: row.organizer_id,
    organizerName: row.organizer_name,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at.toISOString(),
    startsAtLocal: toLocalDateTime(row.starts_at, row.time_zone),
    timeZone: row.time_zone,
    venue: row.venue,
    capacity: row.capacity,
    registeredCount: row.registered_count,
    availablePlaces,
    status: row.status,
    eventType: row.event_type,
    category: row.category,
    slug: row.slug,
    onlineUrl: includeOnlineUrl ? row.online_url : null,
    socialLinks: row.social_links,
    images: row.images.map((image) => ({
      id: image.id,
      url: toUploadUrl(image.fileName)
    })),
    slots: row.slots.map((slot) => toSlotDto(slot, row.time_zone, now)),
    cancellationReason: row.cancellation_reason,
    price: { amountMinor: row.price_minor, currency: row.currency },
    city: row.city,
    venueLocation:
      row.venue_latitude === null || row.venue_longitude === null
        ? null
        : { latitude: row.venue_latitude, longitude: row.venue_longitude },
    distanceKm:
      row.distance_km === undefined || row.distance_km === null
        ? null
        : Math.round(row.distance_km),
    phase,
    publishAt: publishAt.iso,
    publishAtLocal: publishAt.local,
    expiresAt: expiresAt.iso,
    expiresAtLocal: expiresAt.local,
    lastEditedBy: includeStaffFields ? row.updated_by_user : null,
    hasStarted,
    isRegistrationOpen: phase === 'LIVE' && availablePlaces > 0,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
};

export const toAttendeeDto = (row: AttendeeRow): AttendeeDto => ({
  registrationId: row.registration_id,
  attendeeId: row.attendee_id,
  name: row.name,
  email: row.email,
  registeredAt: row.registered_at.toISOString(),
  slotLabel: row.slot_label
});
