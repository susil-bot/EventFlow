import type { Queryable } from '../../db/pool';
import { liveCondition } from '../events/repository/columns';
import type { CityRow } from './types';

/** All cities with their count of live (listed, upcoming) events. */
export const listCitiesWithCounts = async (
  db: Queryable
): Promise<CityRow[]> => {
  const { rows } = await db.query<CityRow>(
    `SELECT c.id, c.name, c.state, c.country_code, c.latitude, c.longitude,
            c.time_zone, c.aliases, c.is_popular,
            count(e.id)::int AS upcoming_event_count
       FROM cities c
       LEFT JOIN events e
         ON e.city_id = c.id AND ${liveCondition('e')}
      GROUP BY c.id
      ORDER BY c.is_popular DESC, c.sort_order, c.name`
  );
  return rows;
};
