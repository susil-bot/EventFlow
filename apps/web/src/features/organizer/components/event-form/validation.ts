import type {
  EventCategory,
  EventImage,
  EventInput,
  EventType,
  FieldErrors,
  SocialLink,
  VenueLocation
} from '@/shared/api/types';
import type { SlotFormValue } from '../slots-field';
import { validateSchedule } from './schedule';

export type EventFormValues = {
  title: string;
  description: string;
  eventType: EventType;
  /** Empty until the organizer picks one. */
  category: EventCategory | '';
  slug: string;
  startsAtLocal: string;
  timeZone: string;
  /** Empty until chosen; not used for online events. */
  cityId: string;
  venue: string;
  /** Map pin; needed to publish an in-person or hybrid event. */
  venueLocation: VenueLocation | null;
  onlineUrl: string;
  capacity: string;
  /** Rupees as typed, e.g. "399" or "1499.50". */
  price: string;
  socialLinks: SocialLink[];
  images: EventImage[];
  slots: SlotFormValue[];
  /** Go live at a set time instead of when published. */
  scheduleGoLive: boolean;
  publishAtLocal: string;
  /** Take the listing down before the event starts. */
  endListingEarly: boolean;
  expiresAtLocal: string;
  /** Already live: the go-live time can't change (unpublish first). */
  goLiveLocked: boolean;
  /** Published (scheduled or live): its start must stay in the future. */
  isPublished: boolean;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Whole rupees or up to two decimals (paise). */
const PRICE_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const MAX_PRICE_MINOR = 10_000_000;

/** "399.5" → 39950 paise (string maths avoids float rounding). */
const toPriceMinor = (rupees: string): number => {
  const [whole = '0', fraction = ''] = rupees.trim().split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
};

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const isWholeNumberAtLeast = (value: string, min: number) => {
  const number = Number(value);
  return value.trim() !== '' && Number.isInteger(number) && number >= min;
};

const validateSlots = (slots: SlotFormValue[], errors: FieldErrors) => {
  slots.forEach((slot, index) => {
    const key = (field: keyof SlotFormValue) => `slots.${index}.${field}`;
    if (!slot.label.trim()) {
      errors[key('label')] = 'Slot name is required.';
    }
    if (!slot.startsAtLocal) {
      errors[key('startsAtLocal')] = 'Slot start is required.';
    }
    if (!slot.endsAtLocal) {
      errors[key('endsAtLocal')] = 'Slot end is required.';
    } else if (slot.startsAtLocal && slot.endsAtLocal <= slot.startsAtLocal) {
      errors[key('endsAtLocal')] = 'End time must be after the start time.';
    }
    if (!isWholeNumberAtLeast(slot.capacity, 1)) {
      errors[key('capacity')] = 'Seats must be a whole number of at least 1.';
    }
  });
  const starts = slots.map((slot) => slot.startsAtLocal).filter(Boolean);
  if (new Set(starts).size !== starts.length) {
    errors.slots = "Two slots can't start at the same time.";
  }
};

const VENUE_PIN_REQUIRED = 'Pin the venue on the map before publishing.';

/**
 * Client-side checks mirroring the API schema for fast feedback. The API
 * remains the source of truth (e.g. "start must be in the future" is
 * evaluated server-side in the event's own time zone). `publishing` adds
 * the checks that only apply when the event goes public (the map pin).
 */
export const validateEventForm = (
  values: EventFormValues,
  minCapacity = 0,
  { publishing = false }: { publishing?: boolean } = {}
): FieldErrors => {
  const errors: FieldErrors = {};
  const hasSlots = values.slots.length > 0;

  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  }
  if (!values.description.trim()) {
    errors.description = 'Description is required.';
  }
  if (!values.category) {
    errors.category = 'Choose a category.';
  }
  if (values.slug && !SLUG_PATTERN.test(values.slug)) {
    errors.slug = 'Use lowercase letters, numbers and single hyphens.';
  } else if (values.slug && values.slug.length < 3) {
    errors.slug = 'Event URL must be at least 3 characters.';
  }
  if (!values.timeZone) {
    errors.timeZone = 'Time zone is required.';
  }
  if (values.eventType !== 'ONLINE') {
    if (!values.cityId) {
      errors.cityId = 'Choose the city where the event happens.';
    }
    if (!values.venue.trim()) {
      errors.venue = 'Venue is required.';
    }
    if (publishing && !values.venueLocation) {
      errors.venueLocation = VENUE_PIN_REQUIRED;
    }
  }
  if (values.eventType !== 'IN_PERSON') {
    if (!values.onlineUrl.trim()) {
      errors.onlineUrl =
        'Meeting link is required for online and hybrid events.';
    } else if (!isHttpsUrl(values.onlineUrl.trim())) {
      errors.onlineUrl = 'Enter a valid https:// link.';
    }
  }
  if (!PRICE_PATTERN.test(values.price.trim())) {
    errors.priceMinor = 'Enter a price in rupees, e.g. 0 or 399.';
  } else if (toPriceMinor(values.price) > MAX_PRICE_MINOR) {
    errors.priceMinor = 'Price can be at most ₹1,00,000.';
  }
  values.socialLinks.forEach((link, index) => {
    if (!isHttpsUrl(link.url.trim())) {
      errors[`socialLinks.${index}.url`] = 'Enter a valid https:// link.';
    }
  });
  validateSchedule(values, errors, { publishing });

  if (hasSlots) {
    validateSlots(values.slots, errors);
    return errors;
  }

  if (!values.startsAtLocal) {
    errors.startsAtLocal = 'Start date and time is required.';
  }
  if (!isWholeNumberAtLeast(values.capacity, 1)) {
    errors.capacity = 'Capacity must be a whole number of at least 1.';
  } else if (Number(values.capacity) < minCapacity) {
    errors.capacity = `Must be at least ${minCapacity}, the number of active registrations.`;
  }
  return errors;
};

export const toEventInput = (values: EventFormValues): EventInput => {
  const hasSlots = values.slots.length > 0;
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    eventType: values.eventType,
    category: values.category || 'OTHER',
    slug: values.slug,
    timeZone: values.timeZone,
    venue: values.venue.trim(),
    cityId: values.eventType === 'ONLINE' ? null : values.cityId || null,
    venueLocation: values.eventType === 'ONLINE' ? null : values.venueLocation,
    priceMinor: toPriceMinor(values.price),
    onlineUrl: values.eventType === 'IN_PERSON' ? '' : values.onlineUrl.trim(),
    socialLinks: values.socialLinks.map((link) => ({
      ...link,
      url: link.url.trim()
    })),
    imageIds: values.images.map((image) => image.id),
    // A live event keeps its go-live time; the API refuses to change it.
    ...(values.goLiveLocked
      ? {}
      : {
          publishAtLocal: values.scheduleGoLive ? values.publishAtLocal : null
        }),
    expiresAtLocal: values.endListingEarly ? values.expiresAtLocal : null,
    slots: values.slots.map((slot) => ({
      label: slot.label.trim(),
      startsAtLocal: slot.startsAtLocal,
      endsAtLocal: slot.endsAtLocal,
      capacity: Number(slot.capacity)
    })),
    // With slots, start time and capacity come from the slots.
    ...(hasSlots
      ? {}
      : {
          startsAtLocal: values.startsAtLocal,
          capacity: Number(values.capacity)
        })
  };
};
