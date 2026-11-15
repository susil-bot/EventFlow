import { pool } from '../../../db/pool';
import type { AuthUser } from '../../auth/types';
import type { Page } from '../../../types/pagination';
import { toEventDto } from '../mappers';
import {
  countByCategory,
  type DiscoverFilters,
  searchPublishedUpcoming
} from '../repository';
import type { DiscoverEventsQuery, EventFacetsQuery } from '../schemas';
import { EVENT_CATEGORIES, type EventCategory, type EventDto } from '../types';

export type CategoryFacet = { category: EventCategory; count: number };
export type EventFacets = { categories: CategoryFacet[]; total: number };

const toFilters = (query: EventFacetsQuery): DiscoverFilters => ({
  q: query.q,
  categories: query.categories,
  eventTypes: query.eventTypes,
  startsAfter: query.startsAfter,
  startsBefore: query.startsBefore,
  minPriceMinor: query.minPriceMinor,
  maxPriceMinor: query.maxPriceMinor,
  city: query.city,
  radiusKm: query.radiusKm,
  includeOnline: query.includeOnline
});

/**
 * Public discovery: live events, filtered and paged. A signed-in organizer
 * also gets the schedule of their own events (admins: of every event), so
 * their cards can show "Listed until …".
 */
export const listPublicEvents = async (
  query: DiscoverEventsQuery,
  viewer?: AuthUser
): Promise<Page<EventDto>> => {
  const now = new Date();
  const { rows, total } = await searchPublishedUpcoming(
    pool,
    toFilters(query),
    {
      sort: query.sort,
      limit: query.limit,
      offset: query.offset
    }
  );
  return {
    items: rows.map((row) =>
      toEventDto(row, now, {
        includeStaffFields:
          viewer?.role === 'ADMIN' || row.organizer_id === viewer?.id
      })
    ),
    total,
    limit: query.limit,
    offset: query.offset
  };
};

/**
 * Event count per category for the other filters, in display order and
 * including empty categories, so the UI can show "Workshops (4)" and
 * dim the empty ones. `total` counts every category.
 */
export const getEventFacets = async (
  query: EventFacetsQuery
): Promise<EventFacets> => {
  const counts = new Map(
    (await countByCategory(pool, toFilters(query))).map((row) => [
      row.category,
      row.count
    ])
  );
  const categories = EVENT_CATEGORIES.map((category) => ({
    category,
    count: counts.get(category) ?? 0
  }));
  return {
    categories,
    total: categories.reduce((sum, facet) => sum + facet.count, 0)
  };
};
