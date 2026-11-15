import type {
  EventCategory,
  EventDto,
  EventSlot,
  EventStatus,
  EventType,
  Price,
  SocialPlatform
} from '@/shared/api/types';

type ZonedInput = Pick<EventDto, 'startsAt' | 'timeZone'>;

const format = (
  { startsAt, timeZone }: ZonedInput,
  options: Intl.DateTimeFormatOptions
) =>
  new Intl.DateTimeFormat('en-US', { timeZone, ...options }).format(
    new Date(startsAt)
  );

/** "Wednesday, September 3, 2025" in the event's own time zone. */
export const formatEventDay = (event: ZonedInput) =>
  format(event, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

/** "10:00 AM GMT+5:30" in the event's own time zone. */
export const formatEventTime = (event: ZonedInput) =>
  format(event, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

/** "Jan 16, 2025 | 2:30 PM" — compact form used on cards. */
export const formatEventShort = (event: ZonedInput) =>
  `${format(event, { month: 'short', day: 'numeric', year: 'numeric' })} | ${format(
    event,
    { hour: 'numeric', minute: '2-digit' }
  )}`;

/** Parts for the calendar tile: { month: 'SEP', day: '3' }. */
export const getDateBadgeParts = (event: ZonedInput) => ({
  month: format(event, { month: 'short' }).toUpperCase(),
  day: format(event, { day: 'numeric' })
});

/** Local registration timestamp for tables. */
export const formatTimestamp = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(iso));

export type AvailabilityTone = 'success' | 'warning' | 'danger' | 'neutral';

export type Availability = { label: string; tone: AvailabilityTone };

type AvailabilityInput = Pick<
  EventDto,
  'status' | 'hasStarted' | 'availablePlaces' | 'capacity'
> &
  Partial<Pick<EventDto, 'phase'>>;

/** Short availability label shown on cards and in the registration panel. */
export const getAvailability = ({
  status,
  phase,
  hasStarted,
  availablePlaces,
  capacity
}: AvailabilityInput): Availability => {
  if (status === 'CANCELED') {
    return { label: 'Canceled', tone: 'danger' };
  }
  if (status === 'DRAFT') {
    return { label: 'Draft', tone: 'neutral' };
  }
  if (phase === 'SCHEDULED') {
    return { label: 'Not live yet', tone: 'neutral' };
  }
  if (hasStarted || phase === 'EXPIRED') {
    return { label: 'Registration closed', tone: 'neutral' };
  }
  if (availablePlaces === 0) {
    return { label: 'Sold out', tone: 'danger' };
  }
  const plural = availablePlaces === 1 ? 'place' : 'places';
  const isLow = availablePlaces / capacity <= 0.2;
  return {
    label: `${availablePlaces} ${plural} left`,
    tone: isLow ? 'warning' : 'success'
  };
};

export const STATUS_LABEL: Record<EventStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CANCELED: 'Canceled'
};

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  IN_PERSON: 'In person',
  ONLINE: 'Online',
  HYBRID: 'Hybrid'
};

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  WORKSHOP: 'Workshop',
  MUSIC_SHOW: 'Music show',
  COMEDY_SHOW: 'Comedy show',
  PERFORMANCE: 'Performance',
  KIDS: 'Kids',
  CONFERENCE: 'Conference',
  MEETUP: 'Meetup',
  EXHIBITION: 'Exhibition',
  SCREENING: 'Screening',
  PARTY: 'Party',
  NETWORKING: 'Networking',
  HACKATHON: 'Hackathon',
  WEBINAR: 'Webinar',
  OTHER: 'Other'
};

/** Plural labels for filter chips ("Comedy shows"). */
export const CATEGORY_PLURAL_LABEL: Record<EventCategory, string> = {
  WORKSHOP: 'Workshops',
  MUSIC_SHOW: 'Music shows',
  COMEDY_SHOW: 'Comedy shows',
  PERFORMANCE: 'Performances',
  KIDS: 'Kids',
  CONFERENCE: 'Conferences',
  MEETUP: 'Meetups',
  EXHIBITION: 'Exhibitions',
  SCREENING: 'Screenings',
  PARTY: 'Parties',
  NETWORKING: 'Networking',
  HACKATHON: 'Hackathons',
  WEBINAR: 'Webinars',
  OTHER: 'Other'
};

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0
});

/** "Free", "₹399" or "₹1,499.50". */
export const formatPrice = (price: Price): string =>
  price.amountMinor === 0 ? 'Free' : rupees.format(price.amountMinor / 100);

export const SOCIAL_LABEL: Record<SocialPlatform, string> = {
  WEBSITE: 'Website',
  X: 'X (Twitter)',
  LINKEDIN: 'LinkedIn',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  YOUTUBE: 'YouTube'
};

/** "Mon, Sep 3 · 10:00 AM – 12:00 PM" in the event's own time zone. */
export const formatSlotRange = (
  slot: Pick<EventSlot, 'startsAt' | 'endsAt'>,
  timeZone: string
) => {
  const day = format(
    { startsAt: slot.startsAt, timeZone },
    { weekday: 'short', month: 'short', day: 'numeric' }
  );
  const time = (iso: string) =>
    format({ startsAt: iso, timeZone }, { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time(slot.startsAt)} – ${time(slot.endsAt)}`;
};

/** URL-friendly slug, mirroring the API's slug rules. */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
