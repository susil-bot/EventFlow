export type Role = 'ORGANIZER' | 'ATTENDEE' | 'ADMIN';

/** Roles available at sign-up; admins are created with a CLI script. */
export type SignupRole = Exclude<Role, 'ADMIN'>;

export const ACCOUNT_STATUSES = [
  'ACTIVE',
  'PENDING_APPROVAL',
  'SUSPENDED'
] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  /** Saved city for Discover; null until the user picks one. */
  homeCityId: string | null;
};

/** A supported city (`GET /cities`). */
export type City = {
  id: string;
  name: string;
  state: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  /** Other names people search for, e.g. "Bombay". */
  aliases: string[];
  isPopular: boolean;
  upcomingEventCount: number;
};

export type CitySummary = Pick<City, 'id' | 'name'>;

/** Map pin for a venue (WGS 84). */
export type VenueLocation = { latitude: number; longitude: number };

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELED';

/**
 * Where an event is in its life (from the API): DRAFT, SCHEDULED
 * (published, goes live later), LIVE, EXPIRED (listing ended), ENDED
 * (started) or CANCELED.
 */
export type EventPhase =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'LIVE'
  | 'EXPIRED'
  | 'ENDED'
  | 'CANCELED';

export const EVENT_TYPES = ['IN_PERSON', 'ONLINE', 'HYBRID'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** Same order as the API; it is the display order of category chips. */
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

export type EventImage = { id: string; url: string };

export type EventSlot = {
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

/** Money in minor units (paise for INR). */
export type Price = { amountMinor: number; currency: 'INR' };

export type EventDto = {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  startsAt: string;
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
  /** Only sent to the owner and to attendees holding a place. */
  onlineUrl: string | null;
  socialLinks: SocialLink[];
  /** Ordered; the first image is the cover. */
  images: EventImage[];
  /** Empty for single-session events. */
  slots: EventSlot[];
  /** Why the event was canceled, when a reason was given. */
  cancellationReason: string | null;
  /** Where an in-person or hybrid event happens; null for online events. */
  city: CitySummary | null;
  /** Map pin for the venue; null when not set and for online events. */
  venueLocation: VenueLocation | null;
  /** Km from the visitor's city in discovery results (0 = same city). */
  distanceKm: number | null;
  /** Ticket price; amount 0 means free. */
  price: Price;
  hasStarted: boolean;
  phase: EventPhase;
  /** Go-live and listing-end times; only sent to the organizer and admins. */
  publishAt: string | null;
  publishAtLocal: string | null;
  expiresAt: string | null;
  expiresAtLocal: string | null;
  /** Who last edited the event (organizer or admin); staff only. */
  lastEditedBy: { id: string; name: string } | null;
  isRegistrationOpen: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RegistrationStatus = 'ACTIVE' | 'CANCELED';

export type RegistrationDto = {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  canceledAt: string | null;
  slot: EventSlot | null;
  event: EventDto;
};

export type AttendeeDto = {
  registrationId: string;
  attendeeId: string;
  name: string;
  email: string;
  registeredAt: string;
  slotLabel: string | null;
};

export type SlotInput = {
  label: string;
  startsAtLocal: string;
  endsAtLocal: string;
  capacity: number;
};

/**
 * Event form payload. With slots, `startsAtLocal` and `capacity` are left
 * out (the API derives them from the slots).
 */
export type EventInput = {
  title: string;
  description: string;
  eventType: EventType;
  category: EventCategory;
  slug: string;
  startsAtLocal?: string;
  timeZone: string;
  venue: string;
  /** Required unless the event is online. */
  cityId: string | null;
  /**
   * Map pin; needed to publish an in-person or hybrid event. Left out on
   * edit when unchanged.
   */
  venueLocation?: VenueLocation | null;
  /** Ticket price in paise; 0 = free. */
  priceMinor: number;
  /** Wall-clock in the event's zone; null = when published / until start. */
  publishAtLocal?: string | null;
  expiresAtLocal?: string | null;
  onlineUrl: string;
  capacity?: number;
  socialLinks: SocialLink[];
  imageIds: string[];
  /** Left out on edit when unchanged; `[]` means a single session. */
  slots?: SlotInput[];
};

export type CreateEventInput = EventInput & { publish: boolean };

export type FieldErrors = Record<string, string>;

/* ---------- Admin ---------- */

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  statusChangedAt: string | null;
  createdAt: string;
  upcomingEventCount: number;
  activeRegistrationCount: number;
};

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminUserFilters = {
  role?: Role;
  status?: AccountStatus;
  search?: string;
  limit?: number;
  offset?: number;
};

export type PlatformStats = {
  users: Record<Role, number>;
  pendingOrganizers: number;
  suspendedUsers: number;
  events: Record<EventStatus, number>;
  upcomingPublishedEvents: number;
  activeRegistrations: number;
};

export type AdminAction =
  | 'APPROVE_ORGANIZER'
  | 'SUSPEND_USER'
  | 'REACTIVATE_USER'
  | 'CHANGE_ROLE'
  | 'CANCEL_EVENT'
  | 'EDIT_EVENT'
  | 'PUBLISH_EVENT'
  | 'UNPUBLISH_EVENT';

export type AuditEntry = {
  id: string;
  adminId: string;
  adminName: string;
  action: AdminAction;
  targetType: 'USER' | 'EVENT';
  targetId: string;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

/* ---------- Discovery ---------- */

export const EVENT_SORTS = [
  'soonest',
  'most-available',
  'newest',
  'nearest'
] as const;
export type EventSort = (typeof EVENT_SORTS)[number];

/** Filters shared by `GET /events` and `GET /events/facets`. */
export type DiscoverFilterQuery = {
  q?: string;
  /** Any of these (sent comma-separated). */
  categories?: EventCategory[];
  eventTypes?: EventType[];
  startsAfter?: string;
  startsBefore?: string;
  /** Inclusive price range in paise. */
  minPriceMinor?: number;
  maxPriceMinor?: number;
  /** Visitor's city id. */
  city?: string;
  /** With a city: also include cities within this distance (0 = city only). */
  radiusKm?: number;
  /** Include online and hybrid events from anywhere (default true). */
  includeOnline?: boolean;
};

/** Query for `GET /events`; every field is optional. */
export type DiscoverQuery = DiscoverFilterQuery & {
  sort?: EventSort;
  limit?: number;
  offset?: number;
};

export type CategoryFacet = { category: EventCategory; count: number };

/** `GET /events/facets`: events per category for the other filters. */
export type EventFacets = { categories: CategoryFacet[]; total: number };
