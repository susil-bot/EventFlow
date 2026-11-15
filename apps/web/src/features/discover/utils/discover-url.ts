import {
  type DiscoverFilterQuery,
  type DiscoverQuery,
  EVENT_CATEGORIES,
  EVENT_SORTS,
  EVENT_TYPES,
  type EventCategory,
  type EventSort,
  type EventType
} from '@/shared/api/types';
import { type DateOption, dateRangeFor, isDateOption } from './date-ranges';

/**
 * Discover lives at `/discover/events-<city>` (or `/discover/events` for
 * every city) with readable query params, e.g.
 * `/discover/events-chennai?categories=workshops|music-shows&date=today`.
 * This module is the only place that knows the URL format.
 */

export const PAGE_SIZE = 12;
export const DISCOVER_BASE = '/discover';
const SEGMENT_PREFIX = 'events';
const CITY_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LIST_SEPARATOR = '|';

const CATEGORY_SLUG: Record<EventCategory, string> = {
  WORKSHOP: 'workshops',
  MUSIC_SHOW: 'music-shows',
  COMEDY_SHOW: 'comedy-shows',
  PERFORMANCE: 'performances',
  KIDS: 'kids',
  CONFERENCE: 'conferences',
  MEETUP: 'meetups',
  EXHIBITION: 'exhibitions',
  SCREENING: 'screenings',
  PARTY: 'parties',
  NETWORKING: 'networking',
  HACKATHON: 'hackathons',
  WEBINAR: 'webinars',
  OTHER: 'other'
};

const FORMAT_SLUG: Record<EventType, string> = {
  IN_PERSON: 'in-person',
  ONLINE: 'online',
  HYBRID: 'hybrid'
};

export const PRICE_OPTIONS = [
  'free',
  'under-500',
  '500-2000',
  'above-2000'
] as const;
export type PriceOption = (typeof PRICE_OPTIONS)[number];

export const PRICE_LABEL: Record<PriceOption, string> = {
  free: 'Free',
  'under-500': 'Under ₹500',
  '500-2000': '₹500 – ₹2,000',
  'above-2000': 'Above ₹2,000'
};

/** Inclusive ranges in paise. */
const PRICE_RANGE: Record<
  PriceOption,
  { minPriceMinor?: number; maxPriceMinor?: number }
> = {
  free: { maxPriceMinor: 0 },
  'under-500': { minPriceMinor: 1, maxPriceMinor: 49_999 },
  '500-2000': { minPriceMinor: 50_000, maxPriceMinor: 200_000 },
  'above-2000': { minPriceMinor: 200_001 }
};

/** 0 = the chosen city only. */
export const RADIUS_OPTIONS = [0, 100, 300, 500] as const;
export type RadiusOption = (typeof RADIUS_OPTIONS)[number];

export type DiscoverFilters = {
  q: string;
  categories: EventCategory[];
  formats: EventType[];
  date: DateOption | null;
  price: PriceOption | null;
  radiusKm: RadiusOption;
  includeOnline: boolean;
  sort: EventSort;
  /** 1-based. */
  page: number;
};

export const DEFAULT_FILTERS: DiscoverFilters = {
  q: '',
  categories: [],
  formats: [],
  date: null,
  price: null,
  radiusKm: 0,
  includeOnline: true,
  sort: 'soonest',
  page: 1
};

const bySlug = <T extends string>(
  values: readonly T[],
  slugs: Record<T, string>
) => new Map(values.map((value) => [slugs[value], value]));

const CATEGORY_BY_SLUG = bySlug(EVENT_CATEGORIES, CATEGORY_SLUG);
const FORMAT_BY_SLUG = bySlug(EVENT_TYPES, FORMAT_SLUG);

/** Known values from a `a|b|c` list, in canonical order, without repeats. */
const parseList = <T extends string>(
  text: string | null,
  lookup: Map<string, T>,
  order: readonly T[]
): T[] => {
  const found = new Set(
    (text ?? '')
      .split(LIST_SEPARATOR)
      .map((slug) => lookup.get(slug.trim().toLowerCase()))
      .filter((value): value is T => value !== undefined)
  );
  return order.filter((value) => found.has(value));
};

const oneOf = <T extends string | number>(
  options: readonly T[],
  value: unknown
): T | undefined => options.find((option) => option === value);

/**
 * `events` → all cities, `events-chennai` → `chennai`, anything else →
 * `undefined` (not a Discover URL).
 */
export const parseCitySegment = (
  segment: string | undefined
): string | null | undefined => {
  if (segment === SEGMENT_PREFIX) {
    return null;
  }
  const cityId = segment?.startsWith(`${SEGMENT_PREFIX}-`)
    ? segment.slice(SEGMENT_PREFIX.length + 1)
    : undefined;
  return cityId && CITY_ID.test(cityId) ? cityId : undefined;
};

/** Reads filters from the query string, ignoring anything unknown. */
export const parseDiscoverSearch = (
  params: URLSearchParams
): DiscoverFilters => {
  const page = Number(params.get('page'));
  return {
    q: (params.get('q') ?? '').trim().slice(0, 100),
    categories: parseList(
      params.get('categories'),
      CATEGORY_BY_SLUG,
      EVENT_CATEGORIES
    ),
    formats: parseList(params.get('formats'), FORMAT_BY_SLUG, EVENT_TYPES),
    date: isDateOption(params.get('date'))
      ? (params.get('date') as DateOption)
      : null,
    price: oneOf(PRICE_OPTIONS, params.get('price')) ?? null,
    radiusKm: oneOf(RADIUS_OPTIONS, Number(params.get('radius'))) ?? 0,
    includeOnline: params.get('online') !== 'no',
    sort: oneOf(EVENT_SORTS, params.get('sort')) ?? 'soonest',
    page: Number.isInteger(page) && page > 1 && page <= 500 ? page : 1
  };
};

/**
 * Short, stable query string: defaults are left out and lists are written
 * in a fixed order, so the same filters always give the same URL. The
 * `|` separator is kept readable rather than percent-encoded.
 */
export const toDiscoverSearch = (filters: DiscoverFilters): string => {
  const parts: [string, string][] = [];
  const add = (key: string, value: string) => parts.push([key, value]);
  if (filters.q) add('q', encodeURIComponent(filters.q));
  if (filters.categories.length > 0) {
    add(
      'categories',
      filters.categories
        .map((category) => CATEGORY_SLUG[category])
        .join(LIST_SEPARATOR)
    );
  }
  if (filters.formats.length > 0) {
    add(
      'formats',
      filters.formats.map((format) => FORMAT_SLUG[format]).join(LIST_SEPARATOR)
    );
  }
  if (filters.date) add('date', filters.date);
  if (filters.price) add('price', filters.price);
  if (filters.radiusKm > 0) add('radius', String(filters.radiusKm));
  if (!filters.includeOnline) add('online', 'no');
  if (filters.sort !== 'soonest') add('sort', filters.sort);
  if (filters.page > 1) add('page', String(filters.page));
  const text = parts.map(([key, value]) => `${key}=${value}`).join('&');
  return text ? `?${text}` : '';
};

/** `/discover/events-chennai?…` for a city, `/discover/events?…` for all. */
export const discoverHref = (
  cityId: string | null,
  filters: Partial<DiscoverFilters> = {}
): string => {
  const segment = cityId ? `${SEGMENT_PREFIX}-${cityId}` : SEGMENT_PREFIX;
  return `${DISCOVER_BASE}/${segment}${toDiscoverSearch({
    ...DEFAULT_FILTERS,
    ...filters
  })}`;
};

/**
 * Filters for another city: distance and "nearest first" need a city, so
 * they are dropped for "all cities".
 */
export const filtersForCity = (
  filters: DiscoverFilters,
  cityId: string | null
): DiscoverFilters =>
  cityId
    ? { ...filters, page: 1 }
    : {
        ...filters,
        radiusKm: 0,
        sort: filters.sort === 'nearest' ? 'soonest' : filters.sort,
        page: 1
      };

/** Number of applied filters, for the "Filters (3)" button. */
export const countActiveFilters = (filters: DiscoverFilters) =>
  filters.categories.length +
  filters.formats.length +
  Number(filters.date !== null) +
  Number(filters.price !== null) +
  Number(filters.radiusKm > 0) +
  Number(!filters.includeOnline);

/** Filters shared by the listing and the category counts. */
export const toFilterQuery = (
  filters: DiscoverFilters,
  cityId: string | null,
  now = new Date()
): DiscoverFilterQuery => ({
  q: filters.q || undefined,
  categories: filters.categories.length > 0 ? filters.categories : undefined,
  eventTypes: filters.formats.length > 0 ? filters.formats : undefined,
  ...dateRangeFor(filters.date, now),
  ...(filters.price ? PRICE_RANGE[filters.price] : {}),
  city: cityId ?? undefined,
  radiusKm: cityId && filters.radiusKm > 0 ? filters.radiusKm : undefined,
  includeOnline: filters.includeOnline ? undefined : false
});

/** What `GET /events` is asked for. */
export const toDiscoverQuery = (
  filters: DiscoverFilters,
  cityId: string | null,
  now = new Date()
): DiscoverQuery => ({
  ...toFilterQuery(filters, cityId, now),
  sort: !cityId && filters.sort === 'nearest' ? 'soonest' : filters.sort,
  limit: PAGE_SIZE,
  offset: (filters.page - 1) * PAGE_SIZE
});
