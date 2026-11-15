import { z } from 'zod';
import { isValidTimeZone, LOCAL_DATE_TIME_PATTERN } from '../time';
import { EVENT_CATEGORIES, EVENT_TYPES } from '../types';
import {
  MAX_CAPACITY,
  MAX_IMAGES,
  RESERVED_SLUGS,
  SLUG_PATTERN
} from './limits';
import { httpsUrl } from './urls';

/** Field-level schemas reused by the create and update event schemas. */

export const title = z
  .string({ error: 'Title is required.' })
  .trim()
  .min(1, 'Title is required.')
  .max(150, 'Title must be 150 characters or fewer.');
export const description = z
  .string({ error: 'Description is required.' })
  .trim()
  .min(1, 'Description is required.')
  .max(5000, 'Description must be 5000 characters or fewer.');
/** Venue may be blank for online-only events; checked per event type. */
export const venue = z
  .string({ error: 'Venue is required.' })
  .trim()
  .max(200, 'Venue must be 200 characters or fewer.');
export const localDateTime = (message: string) =>
  z.string({ error: message }).regex(LOCAL_DATE_TIME_PATTERN, message);
export const startsAtLocal = localDateTime('Start date and time is required.');
/** Go-live time, wall-clock in the event's zone; null = when published. */
export const publishAtLocal = localDateTime(
  'Enter the date and time it should go live.'
).nullable();
/** Listing end, wall-clock in the event's zone; null = until it starts. */
export const expiresAtLocal = localDateTime(
  'Enter the date and time the listing should end.'
).nullable();
/** Map pin for the venue (WGS 84), e.g. picked on the event form's map. */
export const venueLocation = z
  .object(
    {
      latitude: z
        .number({ error: 'Latitude must be a number.' })
        .min(-90, 'Latitude must be between -90 and 90.')
        .max(90, 'Latitude must be between -90 and 90.'),
      longitude: z
        .number({ error: 'Longitude must be a number.' })
        .min(-180, 'Longitude must be between -180 and 180.')
        .max(180, 'Longitude must be between -180 and 180.')
    },
    { error: 'Pin the venue on the map.' }
  )
  .strict();
/** A supported city id (see the `cities` table), e.g. `chennai`. */
export const cityId = z
  .string({ error: 'Choose a city.' })
  .trim()
  .toLowerCase()
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Choose a city from the list.');
export const timeZone = z
  .string({ error: 'Time zone is required.' })
  .min(1, 'Time zone is required.')
  .refine(isValidTimeZone, 'Choose a valid time zone.');
export const capacity = z
  .number({
    error: (issue) =>
      issue.input === undefined
        ? 'Capacity is required.'
        : 'Capacity must be a number.'
  })
  .int('Capacity must be a whole number.')
  .positive('Capacity must be at least 1.')
  .max(MAX_CAPACITY, `Capacity must be ${MAX_CAPACITY} or fewer.`);

/** ₹1,00,000 in paise. */
export const MAX_PRICE_MINOR = 10_000_000;

/** Ticket price in minor units (paise); 0 = free. */
export const priceMinor = z
  .number({ error: 'Price must be a number.' })
  .int('Price must be a whole number of paise.')
  .min(0, 'Price cannot be negative.')
  .max(MAX_PRICE_MINOR, 'Price can be at most ₹1,00,000.');

export const eventType = z.enum(EVENT_TYPES, {
  error: 'Choose an event type.'
});
export const category = z.enum(EVENT_CATEGORIES, {
  error: 'Choose a category.'
});

export const slug = z
  .string({ error: 'Event URL is required.' })
  .trim()
  .toLowerCase()
  .min(3, 'Event URL must be at least 3 characters.')
  .max(80, 'Event URL must be 80 characters or fewer.')
  .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens.')
  .refine((value) => !RESERVED_SLUGS.has(value), 'This URL is reserved.');

/** An empty string clears the link. */
export const onlineUrl = z.union([
  z.literal('').transform(() => null),
  httpsUrl('Meeting link is required.')
]);

export const imageIds = z
  .array(z.uuid('One of the images is invalid. Please upload it again.'))
  .max(MAX_IMAGES, `Add up to ${MAX_IMAGES} images.`)
  .refine(
    (ids) => new Set(ids).size === ids.length,
    'This image has already been added.'
  );
