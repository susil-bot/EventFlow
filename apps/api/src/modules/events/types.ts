import type { CitySummary } from '../cities/types';

export const EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELED'] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

/**
 * Where an event is in its life, derived from status and the clock:
 * DRAFT, SCHEDULED (published, goes live later), LIVE (listed, open),
 * EXPIRED (listing ended before the event), ENDED (started) or CANCELED.
 */
export const EVENT_PHASES = [
  'DRAFT',
  'SCHEDULED',
  'LIVE',
  'EXPIRED',
  'ENDED',
  'CANCELED'
] as const;
export type EventPhase = (typeof EVENT_PHASES)[number];

export const EVENT_TYPES = ['IN_PERSON', 'ONLINE', 'HYBRID'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** Order here is the display order of the category chips. */
export const EVENT_CATEGORIES = [
  'WORKSHOP',
  'MUSIC_SHOW',
  'COMEDY_SHOW',
  'PERFORMANCE',
  'KIDS',
  'CONFERENCE',
  'MEETUP',
  'EXHIBITION',
  'SCREENING',
  'PARTY',
  'NETWORKING',
  'HACKATHON',
  'WEBINAR',
  'OTHER'
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const SOCIAL_PLATFORMS = [
  'WEBSITE',
  'X',
  'LINKEDIN',
  'INSTAGRAM',
  'FACEBOOK',
  'YOUTUBE'
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLink = { platform: SocialPlatform; url: string };

const CURRENCIES = ['INR'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Money in minor units (paise for INR); amount 0 means free. */
export type Price = { amountMinor: number; currency: Currency };

/** Slot as aggregated by the event query (`json_agg`, so dates are strings). */
export type EventSlotJson = {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registeredCount: number;
};

export type VenueLocation = { latitude: number; longitude: number };

export type EventImageJson = { id: string; fileName: string };

export type EventRow = {
  id: string;
  organizer_id: string;
  organizer_name: string;
  title: string;
  description: string;
  starts_at: Date;
  time_zone: string;
  venue: string;
  capacity: number;
  registered_count: number;
  status: EventStatus;
  event_type: EventType;
  category: EventCategory;
  slug: string;
  online_url: string | null;
  social_links: SocialLink[];
  images: EventImageJson[];
  slots: EventSlotJson[];
  cancellation_reason: string | null;
  /** Goes live at this time (null = as soon as it is published). */
  publish_at: Date | null;
  /** Leaves Discover and closes registration at this time. */
  expires_at: Date | null;
  /** Who last edited the event (null if that account was deleted). */
  updated_by_user: { id: string; name: string } | null;
  price_minor: number;
  currency: Currency;
  city: CitySummary | null;
  /** Venue map pin; both null when not set (always null for online events). */
  venue_latitude: number | null;
  venue_longitude: number | null;
  /** Only set by the discovery query when a city is chosen. */
  distance_km?: number | null;
  created_at: Date;
  updated_at: Date;
};

export type EventSlotDto = {
  id: string;
  label: string;
  startsAt: string;
  startsAtLocal: string;
  endsAt: string;
  endsAtLocal: string;
  capacity: number;
  registeredCount: number;
  availablePlaces: number;
  hasStarted: boolean;
};

export type EventImageDto = { id: string; url: string };

export type EventDto = {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  /** UTC instant, ISO 8601. */
  startsAt: string;
  /** Wall-clock start in the event's time zone, `yyyy-MM-ddTHH:mm`. */
  startsAtLocal: string;
  timeZone: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  availablePlaces: number;
  status: EventStatus;
  eventType: EventType;
  category: EventCategory;
  slug: string;
  /** Meeting link; only sent to the owner and to attendees with a place. */
  onlineUrl: string | null;
  socialLinks: SocialLink[];
  /** Ordered promo images; the first one is the cover. */
  images: EventImageDto[];
  /** Empty when the event is a single session. */
  slots: EventSlotDto[];
  /** Why the event was canceled, when a reason was given (e.g. by an admin). */
  cancellationReason: string | null;
  /** Ticket price; amount 0 means free. */
  price: Price;
  /** Where an in-person or hybrid event happens; null for online events. */
  city: CitySummary | null;
  /** Map pin for the venue; null when not set and for online events. */
  venueLocation: VenueLocation | null;
  /**
   * Km from the city the visitor chose, in discovery results (0 = same
   * city); null otherwise and for online events.
   */
  distanceKm: number | null;
  phase: EventPhase;
  /**
   * Scheduling, only sent to the event's organizer and admins (null for
   * everyone else and when not set). UTC ISO plus wall-clock in the
   * event's time zone.
   */
  publishAt: string | null;
  publishAtLocal: string | null;
  expiresAt: string | null;
  expiresAtLocal: string | null;
  /** Who last edited it (organizer or admin); staff only, like the above. */
  lastEditedBy: { id: string; name: string } | null;
  hasStarted: boolean;
  isRegistrationOpen: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AttendeeRow = {
  registration_id: string;
  attendee_id: string;
  name: string;
  email: string;
  registered_at: Date;
  slot_label: string | null;
};

export type AttendeeDto = {
  registrationId: string;
  attendeeId: string;
  name: string;
  email: string;
  registeredAt: string;
  /** Chosen time slot, when the event has slots. */
  slotLabel: string | null;
};

export type EventWriteFields = {
  title?: string;
  description?: string;
  startsAt?: Date;
  timeZone?: string;
  venue?: string;
  capacity?: number;
  eventType?: EventType;
  category?: EventCategory;
  slug?: string;
  onlineUrl?: string | null;
  socialLinks?: SocialLink[];
  cityId?: string | null;
  priceMinor?: number;
  publishAt?: Date | null;
  expiresAt?: Date | null;
  venueLatitude?: number | null;
  venueLongitude?: number | null;
};
