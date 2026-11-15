import type { City } from '@/shared/api/types';

const city = (
  id: string,
  name: string,
  state: string,
  latitude: number,
  longitude: number,
  overrides: Partial<City> = {}
): City => ({
  id,
  name,
  state,
  countryCode: 'IN',
  latitude,
  longitude,
  timeZone: 'Asia/Kolkata',
  aliases: [],
  isPopular: true,
  upcomingEventCount: 0,
  ...overrides
});

/** Mirrors the cities seeded by the API (migration 004). */
export const cities: City[] = [
  city('mumbai', 'Mumbai', 'Maharashtra', 19.076, 72.8777, {
    aliases: ['Bombay'],
    upcomingEventCount: 1
  }),
  city('delhi-ncr', 'Delhi-NCR', 'Delhi', 28.6139, 77.209, {
    aliases: ['Delhi', 'Gurugram', 'Noida']
  }),
  city('bengaluru', 'Bengaluru', 'Karnataka', 12.9716, 77.5946, {
    aliases: ['Bangalore'],
    upcomingEventCount: 2
  }),
  city('hyderabad', 'Hyderabad', 'Telangana', 17.385, 78.4867),
  city('chandigarh', 'Chandigarh', 'Chandigarh', 30.7333, 76.7794),
  city('ahmedabad', 'Ahmedabad', 'Gujarat', 23.0225, 72.5714),
  city('pune', 'Pune', 'Maharashtra', 18.5204, 73.8567, { aliases: ['Poona'] }),
  city('chennai', 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, {
    aliases: ['Madras'],
    upcomingEventCount: 3
  }),
  city('kolkata', 'Kolkata', 'West Bengal', 22.5726, 88.3639, {
    aliases: ['Calcutta']
  }),
  city('kochi', 'Kochi', 'Kerala', 9.9312, 76.2673, { aliases: ['Cochin'] })
];

/** A non-popular city, for the "all cities" list. */
export const otherCity = city(
  'mysuru',
  'Mysuru',
  'Karnataka',
  12.2958,
  76.6394,
  {
    aliases: ['Mysore'],
    isPopular: false
  }
);
