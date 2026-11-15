import { DateTime } from 'luxon';
import request from 'supertest';
import { pool } from '../src/db/pool';
import {
  app,
  createEvent,
  createUser,
  resetDatabase,
  type TestUser
} from './factories';

afterAll(() => pool.end());
beforeEach(resetDatabase);

const inDays = (days: number) => DateTime.now().plus({ days }).toJSDate();

const discover = async (query: Record<string, string | number> = {}) => {
  const response = await request(app)
    .get('/api/events')
    .query(query)
    .expect(200);
  return response.body.data as {
    items: { id: string; title: string; price: unknown }[];
    total: number;
    limit: number;
    offset: number;
  };
};

const titles = (page: { items: { title: string }[] }) =>
  page.items.map((event) => event.title);

describe('GET /api/events (discovery)', () => {
  let olivia: TestUser;

  beforeEach(async () => {
    olivia = await createUser('ORGANIZER', 'Olivia Host');
    await createEvent(olivia, {
      title: 'React Meetup',
      category: 'MEETUP',
      eventType: 'IN_PERSON',
      venue: 'Tidel Park',
      startsAt: inDays(2),
      capacity: 50,
      registeredCount: 45
    });
    await createEvent(olivia, {
      title: 'Postgres Workshop',
      category: 'WORKSHOP',
      eventType: 'ONLINE',
      venue: 'Online',
      startsAt: inDays(10),
      capacity: 20,
      registeredCount: 0
    });
    await createEvent(olivia, {
      title: 'Design Conference',
      category: 'CONFERENCE',
      eventType: 'HYBRID',
      venue: 'Chennai Trade Centre',
      startsAt: inDays(40),
      capacity: 300,
      registeredCount: 100
    });
  });

  it('defaults to the soonest events first with a total', async () => {
    const page = await discover();

    expect(titles(page)).toEqual([
      'React Meetup',
      'Postgres Workshop',
      'Design Conference'
    ]);
    expect(page).toMatchObject({ total: 3, limit: 12, offset: 0 });
  });

  it('filters by any of several categories and formats', async () => {
    expect(titles(await discover({ categories: 'WORKSHOP' }))).toEqual([
      'Postgres Workshop'
    ]);
    expect(
      titles(await discover({ categories: 'CONFERENCE,WORKSHOP,WORKSHOP' }))
    ).toEqual(['Postgres Workshop', 'Design Conference']);
    expect(titles(await discover({ eventTypes: 'HYBRID,IN_PERSON' }))).toEqual([
      'React Meetup',
      'Design Conference'
    ]);
    expect(
      (await discover({ categories: 'WORKSHOP', eventTypes: 'IN_PERSON' }))
        .total
    ).toBe(0);
  });

  it('filters by price range in paise', async () => {
    const organizer = await createUser('ORGANIZER');
    await createEvent(organizer, {
      title: 'Comedy Night',
      category: 'COMEDY_SHOW',
      priceMinor: 39_900,
      startsAt: inDays(2)
    });

    expect(titles(await discover({ maxPriceMinor: 0 }))).toEqual([
      'React Meetup',
      'Postgres Workshop',
      'Design Conference'
    ]);
    expect(
      titles(await discover({ minPriceMinor: 1, maxPriceMinor: 50_000 }))
    ).toEqual(['Comedy Night']);
    const [comedy] = (await discover({ categories: 'COMEDY_SHOW' })).items;
    expect(comedy!.price).toEqual({ amountMinor: 39_900, currency: 'INR' });
  });

  it('filters by a date window', async () => {
    const page = await discover({
      startsAfter: inDays(1).toISOString(),
      startsBefore: inDays(14).toISOString()
    });

    expect(titles(page)).toEqual(['React Meetup', 'Postgres Workshop']);
  });

  it('searches title, venue and host, treating wildcards literally', async () => {
    expect(titles(await discover({ q: 'postgres' }))).toEqual([
      'Postgres Workshop'
    ]);
    expect(titles(await discover({ q: 'trade centre' }))).toEqual([
      'Design Conference'
    ]);
    expect((await discover({ q: 'olivia' })).total).toBe(3);
    expect((await discover({ q: '%' })).total).toBe(0);
  });

  it('sorts by places left and by newest', async () => {
    expect(titles(await discover({ sort: 'most-available' }))).toEqual([
      'Design Conference',
      'Postgres Workshop',
      'React Meetup'
    ]);
    expect(titles(await discover({ sort: 'newest' }))[0]).toBe(
      'Design Conference'
    );
  });

  it('pages through results', async () => {
    const first = await discover({ limit: 2 });
    const second = await discover({ limit: 2, offset: 2 });

    expect(titles(first)).toEqual(['React Meetup', 'Postgres Workshop']);
    expect(titles(second)).toEqual(['Design Conference']);
    expect(second.total).toBe(3);
  });

  it('rejects invalid filters with field errors', async () => {
    const response = await request(app)
      .get('/api/events')
      .query({
        categories: 'PARTY,DISCO',
        sort: 'random',
        limit: 500,
        startsAfter: 'yesterday'
      })
      .expect(400);

    expect(Object.keys(response.body.error.details.fields).sort()).toEqual([
      'categories',
      'limit',
      'sort',
      'startsAfter'
    ]);

    const empty = await request(app)
      .get('/api/events')
      .query({
        startsAfter: inDays(10).toISOString(),
        startsBefore: inDays(5).toISOString()
      })
      .expect(400);
    expect(empty.body.error.details.fields.startsBefore).toBe(
      'The end date must be after the start date.'
    );
    const price = await request(app)
      .get('/api/events')
      .query({ minPriceMinor: 500, maxPriceMinor: 100 })
      .expect(400);
    expect(price.body.error.details.fields.maxPriceMinor).toBe(
      'The maximum price must be greater than or equal to the minimum price.'
    );
  });
});

describe('GET /api/events/facets', () => {
  it('counts events per category for the other filters', async () => {
    const organizer = await createUser('ORGANIZER');
    await createEvent(organizer, { category: 'MEETUP' });
    await createEvent(organizer, { category: 'MEETUP' });
    await createEvent(organizer, { category: 'KIDS', cityId: 'pune' });
    await createEvent(organizer, { category: 'KIDS', status: 'DRAFT' });

    const all = await request(app).get('/api/events/facets').expect(200);
    const counts = (body: {
      data: { categories: { category: string; count: number }[] };
    }) =>
      Object.fromEntries(
        body.data.categories
          .filter((facet) => facet.count > 0)
          .map((facet) => [facet.category, facet.count])
      );

    expect(all.body.data.categories[0].category).toBe('WORKSHOP');
    expect(all.body.data.categories).toHaveLength(14);
    expect(counts(all.body)).toEqual({ MEETUP: 2, KIDS: 1 });
    expect(all.body.data.total).toBe(3);

    // The category filter itself is ignored so unselected chips keep counts.
    const chennai = await request(app)
      .get('/api/events/facets')
      .query({ city: 'chennai', categories: 'MEETUP' })
      .expect(200);
    expect(counts(chennai.body)).toEqual({ MEETUP: 2 });
  });
});
