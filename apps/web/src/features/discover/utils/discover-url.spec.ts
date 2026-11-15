import {
  countActiveFilters,
  DEFAULT_FILTERS,
  discoverHref,
  filtersForCity,
  parseCitySegment,
  parseDiscoverSearch,
  toDiscoverQuery,
  toDiscoverSearch,
  toFilterQuery
} from './discover-url';

const parse = (search: string) =>
  parseDiscoverSearch(new URLSearchParams(search));

describe('Discover URL', () => {
  it('reads the city from the path', () => {
    expect(parseCitySegment('events')).toBeNull();
    expect(parseCitySegment('events-chennai')).toBe('chennai');
    expect(parseCitySegment('events-delhi-ncr')).toBe('delhi-ncr');
    expect(parseCitySegment('events-')).toBeUndefined();
    expect(parseCitySegment('venues-chennai')).toBeUndefined();
    expect(parseCitySegment(undefined)).toBeUndefined();
  });

  it('round-trips filters through a short, readable query string', () => {
    const search =
      '?q=jazz%20night&categories=workshops|music-shows&formats=in-person|online&date=this-weekend&price=under-500&radius=300&online=no&sort=nearest&page=2';
    const filters = parse(search);

    expect(filters).toEqual({
      q: 'jazz night',
      categories: ['WORKSHOP', 'MUSIC_SHOW'],
      formats: ['IN_PERSON', 'ONLINE'],
      date: 'this-weekend',
      price: 'under-500',
      radiusKm: 300,
      includeOnline: false,
      sort: 'nearest',
      page: 2
    });
    expect(toDiscoverSearch(filters)).toBe(search);
  });

  it('writes lists in a fixed order and accepts an encoded separator', () => {
    const filters = parse('categories=nye%7Cmeetups%7Cworkshops%7Cmeetups');
    expect(filters.categories).toEqual(['WORKSHOP', 'MEETUP']);
    expect(toDiscoverSearch(filters)).toBe('?categories=workshops|meetups');
  });

  it('ignores unknown or unsafe values', () => {
    expect(
      parse(
        'categories=x&formats=y&date=yesterday&price=cheap&radius=42&sort=random&page=-3'
      )
    ).toEqual(DEFAULT_FILTERS);
    expect(toDiscoverSearch(DEFAULT_FILTERS)).toBe('');
  });

  it('builds paths for a city or every city', () => {
    expect(discoverHref('chennai', { categories: ['KIDS'] })).toBe(
      '/discover/events-chennai?categories=kids'
    );
    expect(discoverHref(null)).toBe('/discover/events');
  });

  it('drops distance and nearest-first when switching to all cities', () => {
    const filters = {
      ...DEFAULT_FILTERS,
      radiusKm: 300 as const,
      sort: 'nearest' as const,
      page: 3
    };
    expect(filtersForCity(filters, null)).toMatchObject({
      radiusKm: 0,
      sort: 'soonest',
      page: 1
    });
    expect(filtersForCity(filters, 'pune')).toMatchObject({
      radiusKm: 300,
      sort: 'nearest',
      page: 1
    });
  });

  it('counts applied filters', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
    expect(
      countActiveFilters(parse('categories=kids|meetups&price=free&online=no'))
    ).toBe(4);
  });

  it('builds the API query with prices in paise and a resolved date window', () => {
    const now = new Date(2030, 10, 13, 15, 30);
    const filters = parse('categories=kids&price=500-2000&date=today&page=3');

    expect(toDiscoverQuery(filters, 'chennai', now)).toMatchObject({
      categories: ['KIDS'],
      minPriceMinor: 50_000,
      maxPriceMinor: 200_000,
      startsAfter: now.toISOString(),
      city: 'chennai',
      sort: 'soonest',
      limit: 12,
      offset: 24
    });
    expect(toFilterQuery(parse('price=free'), null).maxPriceMinor).toBe(0);
    const anywhere = toDiscoverQuery(parse('radius=300&sort=nearest'), null);
    expect(anywhere).toMatchObject({ sort: 'soonest' });
    expect(anywhere.radiusKm).toBeUndefined();
    expect(anywhere.city).toBeUndefined();
  });
});
