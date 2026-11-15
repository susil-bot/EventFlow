import type { Queryable } from '../../../db/pool';
import { containsPattern } from '../../../db/sql';
import type { EventCategory, EventRow, EventType } from '../types';
import { EVENT_COLUMNS, liveCondition } from './columns';

export type DiscoverSort = 'soonest' | 'most-available' | 'newest' | 'nearest';

export type DiscoverFilters = {
  q?: string;
  /** Any of these categories; empty = all. */
  categories: EventCategory[];
  /** Any of these formats; empty = all. */
  eventTypes: EventType[];
  startsAfter?: Date;
  startsBefore?: Date;
  /** Price range in minor units, inclusive. */
  minPriceMinor?: number;
  maxPriceMinor?: number;
  /** Visitor's chosen city. */
  city?: string;
  /** With a city: also include cities within this many km (0 = city only). */
  radiusKm: number;
  /** Include events people can attend online (online and hybrid). */
  includeOnline: boolean;
};

export type DiscoverPage = {
  sort: DiscoverSort;
  limit: number;
  offset: number;
};

/**
 * Sort keys map to fixed SQL; user input never reaches the ORDER BY. Each
 * ends with `e.id` so paging is stable when values tie.
 */
const DISCOVER_ORDER: Record<DiscoverSort, string> = {
  soonest: 'e.starts_at ASC, e.id',
  'most-available':
    '(e.capacity - e.registered_count) DESC, e.starts_at ASC, e.id',
  newest: 'e.created_at DESC, e.id',
  // Same city first, then by distance; online-only events last.
  nearest: 'distance_km ASC NULLS LAST, e.starts_at ASC, e.id'
};

/**
 * `o` is the visitor's city (no row when none is chosen); `c` the event's.
 * Parameters: $1 formats, $2/$3 date window, $4 keyword, $5 city,
 * $6 radius km, $7 include online, $8/$9 price range, $10 categories (only
 * in the listing, so the facet query can leave it out).
 */
const FROM_DISCOVERY = `
  FROM events e
  JOIN users u ON u.id = e.organizer_id
  LEFT JOIN cities c ON c.id = e.city_id
  LEFT JOIN cities o ON o.id = $5`;

const DISTANCE = `
  CASE WHEN o.id IS NOT NULL AND c.id IS NOT NULL
       THEN distance_km(o.latitude, o.longitude, c.latitude, c.longitude)
  END`;

/** Everything except the category filter (shared with the facet counts). */
const WHERE_BASE = `
  WHERE ${liveCondition('e')}
    AND (cardinality($1::text[]) = 0 OR e.event_type = ANY($1))
    AND ($2::timestamptz IS NULL OR e.starts_at >= $2)
    AND ($3::timestamptz IS NULL OR e.starts_at < $3)
    AND ($4::text IS NULL OR e.title ILIKE $4 OR e.venue ILIKE $4
         OR u.name ILIKE $4)
    AND ($8::int IS NULL OR e.price_minor >= $8)
    AND ($9::int IS NULL OR e.price_minor <= $9)
    AND (
      -- Online-attendable events: shown wherever the visitor is, if wanted.
      (e.event_type <> 'IN_PERSON' AND $7::boolean)
      OR ($5::text IS NULL AND e.event_type <> 'ONLINE')
      OR e.city_id = $5
      OR ($6::int > 0 AND ${DISTANCE} <= $6)
    )`;

const WHERE_DISCOVERY = `${WHERE_BASE}
    AND (cardinality($10::text[]) = 0 OR e.category = ANY($10))`;

/** Unset filters are passed as NULL / empty so the statement stays fixed. */
const baseParams = (filters: DiscoverFilters) => [
  filters.eventTypes,
  filters.startsAfter ?? null,
  filters.startsBefore ?? null,
  filters.q ? containsPattern(filters.q) : null,
  filters.city ?? null,
  filters.radiusKm,
  filters.includeOnline,
  filters.minPriceMinor ?? null,
  filters.maxPriceMinor ?? null
];

/**
 * Published upcoming events matching the filters, one page at a time, plus
 * the total for "1 - 12 of 30 results".
 */
export const searchPublishedUpcoming = async (
  db: Queryable,
  filters: DiscoverFilters,
  { sort, limit, offset }: DiscoverPage
): Promise<{ rows: EventRow[]; total: number }> => {
  const params = [...baseParams(filters), filters.categories];
  const [page, count] = await Promise.all([
    db.query<EventRow>(
      `SELECT ${EVENT_COLUMNS}, ${DISTANCE} AS distance_km
         ${FROM_DISCOVERY} ${WHERE_DISCOVERY}
        ORDER BY ${DISCOVER_ORDER[sort]}
        LIMIT $11 OFFSET $12`,
      [...params, limit, offset]
    ),
    db.query<{ total: number }>(
      `SELECT count(*)::int AS total ${FROM_DISCOVERY} ${WHERE_DISCOVERY}`,
      params
    )
  ]);
  return { rows: page.rows, total: count.rows[0]?.total ?? 0 };
};

/**
 * How many events each category would show with the other filters applied
 * (the category filter itself is ignored, so chips can show counts for
 * categories that aren't selected yet).
 */
export const countByCategory = async (
  db: Queryable,
  filters: DiscoverFilters
): Promise<{ category: EventCategory; count: number }[]> => {
  const { rows } = await db.query<{ category: EventCategory; count: number }>(
    `SELECT e.category, count(*)::int AS count
       ${FROM_DISCOVERY} ${WHERE_BASE}
      GROUP BY e.category`,
    baseParams(filters)
  );
  return rows;
};
