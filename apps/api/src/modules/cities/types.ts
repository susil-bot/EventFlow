export type CityRow = {
  id: string;
  name: string;
  state: string;
  country_code: string;
  latitude: number;
  longitude: number;
  time_zone: string;
  aliases: string[];
  is_popular: boolean;
  upcoming_event_count: number;
};

/** A supported city, as the city picker and event form use it. */
export type CityDto = {
  id: string;
  name: string;
  state: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  aliases: string[];
  isPopular: boolean;
  /** Published events that haven't started yet. */
  upcomingEventCount: number;
};

/** The short form embedded in events. */
export type CitySummary = { id: string; name: string };
