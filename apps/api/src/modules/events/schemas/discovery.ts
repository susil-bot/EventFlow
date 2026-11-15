import { z } from 'zod';
import { EVENT_CATEGORIES, EVENT_TYPES } from '../types';
import { MAX_PRICE_MINOR } from './fields';

const EVENT_SORTS = ['soonest', 'most-available', 'newest', 'nearest'] as const;
export type EventSort = (typeof EVENT_SORTS)[number];

const MAX_PAGE_SIZE = 50;
const MAX_RADIUS_KM = 1000;

const instant = (label: string) =>
  z.iso
    .datetime({ offset: true, error: `${label} must be an ISO date-time.` })
    .transform((value) => new Date(value));

/** Query strings carry booleans as text. */
const booleanParam = z
  .enum(['true', 'false'], { error: 'Use true or false.' })
  .transform((value) => value === 'true');

/**
 * Comma-separated list of enum values (`WORKSHOP,MEETUP`), de-duplicated.
 * Missing or empty means "any".
 */
const enumList = <T extends string>(values: readonly T[], label: string) =>
  z
    .string()
    .max(500)
    .transform((text, ctx): T[] => {
      const parts = text
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      const unknown = parts.find((part) => !values.includes(part as T));
      if (unknown !== undefined) {
        ctx.addIssue({
          code: 'custom',
          message: `Unknown ${label}: ${unknown}.`
        });
        return z.NEVER;
      }
      return [...new Set(parts as T[])];
    })
    .default([]);

const priceParam = z.coerce
  .number()
  .int('Price must be a whole number of paise.')
  .min(0, 'Price cannot be negative.')
  .max(MAX_PRICE_MINOR, 'Price is too high.')
  .optional();

/**
 * Filters shared by the listing and the category counts. Every filter is
 * optional; the date window is sent as instants so the browser decides what
 * "this weekend" means in the visitor's own time zone. Location is a city
 * id (the visitor's exact position never reaches the server). Prices are in
 * minor units (paise).
 */
const filterShape = {
  q: z
    .string()
    .trim()
    .max(100, 'Search must be 100 characters or fewer.')
    .optional(),
  categories: enumList(EVENT_CATEGORIES, 'category'),
  eventTypes: enumList(EVENT_TYPES, 'event format'),
  startsAfter: instant('startsAfter').optional(),
  startsBefore: instant('startsBefore').optional(),
  minPriceMinor: priceParam,
  maxPriceMinor: priceParam,
  city: z
    .string()
    .trim()
    .toLowerCase()
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Unknown city.')
    .optional(),
  radiusKm: z.coerce
    .number()
    .int('Radius must be a whole number of kilometers.')
    .min(0, 'Radius cannot be negative.')
    .max(MAX_RADIUS_KM, `Radius can be at most ${MAX_RADIUS_KM} km.`)
    .default(0),
  includeOnline: booleanParam.default(true)
};

type FilterValues = {
  startsAfter?: Date;
  startsBefore?: Date;
  minPriceMinor?: number;
  maxPriceMinor?: number;
};

const rangesAreValid = <T extends z.ZodType<FilterValues>>(schema: T) =>
  schema
    .refine(
      (value) =>
        !value.startsAfter ||
        !value.startsBefore ||
        value.startsAfter < value.startsBefore,
      {
        message: 'The end date must be after the start date.',
        path: ['startsBefore']
      }
    )
    .refine(
      (value) =>
        value.minPriceMinor === undefined ||
        value.maxPriceMinor === undefined ||
        value.minPriceMinor <= value.maxPriceMinor,
      {
        message:
          'The maximum price must be greater than or equal to the minimum price.',
        path: ['maxPriceMinor']
      }
    );

export const eventFacetsQuerySchema = rangesAreValid(z.object(filterShape));

export const discoverEventsQuerySchema = rangesAreValid(
  z.object({
    ...filterShape,
    sort: z
      .enum(EVENT_SORTS, { error: 'Unknown sort order.' })
      .default('soonest'),
    limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(12),
    offset: z.coerce.number().int().min(0).max(10_000).default(0)
  })
).refine((value) => value.sort !== 'nearest' || value.city !== undefined, {
  message: 'Choose a city to sort by distance.',
  path: ['sort']
});

export type DiscoverEventsQuery = z.infer<typeof discoverEventsQuerySchema>;
export type EventFacetsQuery = z.infer<typeof eventFacetsQuerySchema>;
