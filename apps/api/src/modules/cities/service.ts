import { pool } from '../../db/pool';
import { listCitiesWithCounts } from './repository';
import type { CityDto, CityRow } from './types';

const toCityDto = (row: CityRow): CityDto => ({
  id: row.id,
  name: row.name,
  state: row.state,
  countryCode: row.country_code.trim(),
  latitude: row.latitude,
  longitude: row.longitude,
  timeZone: row.time_zone,
  aliases: row.aliases,
  isPopular: row.is_popular,
  upcomingEventCount: row.upcoming_event_count
});

export const listCities = async (): Promise<CityDto[]> =>
  (await listCitiesWithCounts(pool)).map(toCityDto);
