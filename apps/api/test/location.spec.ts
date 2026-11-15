import { DateTime } from 'luxon';
import request from 'supertest';
import { pool } from '../src/db/pool';
import {
  app,
  createEvent,
  createUser,
  resetDatabase,
  type TestUser,
  validEventBody
} from './factories';

afterAll(() => pool.end());
beforeEach(resetDatabase);

const inDays = (days: number) => DateTime.now().plus({ days }).toJSDate();

type Listed = {
  title: string;
  city: { id: string; name: string } | null;
  distanceKm: number | null;
};

const discover = async (query: Record<string, string | number> = {}) =>
  (await request(app).get('/api/events').query(query).expect(200)).body
    .data as { items: Listed[]; total: number };

const titles = (page: { items: Listed[] }) => page.items.map((e) => e.title);

describe('GET /api/cities', () => {
  it('lists the supported cities, popular first, with upcoming event counts', async () => {
    const organizer = await createUser('ORGANIZER');
    await createEvent(organizer, { cityId: 'chennai' });
    await createEvent(organizer, { cityId: 'chennai' });
    await createEvent(organizer, { cityId: 'chennai', status: 'DRAFT' });
    await createEvent(organizer, {
      cityId: 'chennai',
      startsAt: DateTime.now().minus({ hours: 2 }).toJSDate()
    });

    const response = await request(app).get('/api/cities').expect(200);
    const cities = response.body.data as {
      id: string;
      upcomingEventCount: number;
      isPopular: boolean;
      aliases: string[];
    }[];

    expect(cities).toHaveLength(10);
    expect(cities[0]).toMatchObject({ id: 'mumbai', isPopular: true });
    expect(cities.find((city) => city.id === 'chennai')).toMatchObject({
      upcomingEventCount: 2,
      aliases: ['Madras']
    });
    expect(response.headers['cache-control']).toContain('max-age=60');
  });
});

describe('event city', () => {
  let organizer: TestUser;
  const create = (body: Record<string, unknown>) =>
    request(app)
      .post('/api/events')
      .set('Cookie', organizer.cookie)
      .send(validEventBody(body));

  beforeEach(async () => {
    organizer = await createUser('ORGANIZER');
  });

  it('requires a known city for in-person and hybrid events', async () => {
    const missing = await create({ cityId: undefined }).expect(400);
    expect(missing.body.error.details.fields.cityId).toBe(
      'Choose the city where the event happens.'
    );

    const unknown = await create({ cityId: 'atlantis' }).expect(400);
    expect(unknown.body.error.details.fields.cityId).toBe(
      'Choose a city from the list.'
    );

    const created = await create({ cityId: 'Bengaluru' }).expect(201);
    expect(created.body.data.city).toEqual({
      id: 'bengaluru',
      name: 'Bengaluru'
    });
  });

  it('does not tie online events to a city', async () => {
    const created = await create({
      eventType: 'ONLINE',
      venue: '',
      onlineUrl: 'https://meet.example.com/x',
      cityId: 'pune'
    }).expect(201);

    expect(created.body.data.city).toBeNull();
  });

  it('changes the city on edit and clears it when the event goes online', async () => {
    const created = await create({ cityId: 'chennai' }).expect(201);
    const path = `/api/events/${created.body.data.id}`;

    const moved = await request(app)
      .patch(path)
      .set('Cookie', organizer.cookie)
      .send({ cityId: 'kochi' })
      .expect(200);
    expect(moved.body.data.city.id).toBe('kochi');

    const online = await request(app)
      .patch(path)
      .set('Cookie', organizer.cookie)
      .send({ eventType: 'ONLINE', onlineUrl: 'https://meet.example.com/y' })
      .expect(200);
    expect(online.body.data.city).toBeNull();

    const back = await request(app)
      .patch(path)
      .set('Cookie', organizer.cookie)
      .send({ eventType: 'IN_PERSON' })
      .expect(400);
    expect(back.body.error.details.fields.cityId).toBeDefined();
  });
});

describe('location-aware discovery', () => {
  beforeEach(async () => {
    const organizer = await createUser('ORGANIZER');
    await createEvent(organizer, {
      title: 'Chennai Meetup',
      cityId: 'chennai',
      startsAt: inDays(5)
    });
    await createEvent(organizer, {
      title: 'Bengaluru Hackathon',
      cityId: 'bengaluru',
      startsAt: inDays(2)
    });
    await createEvent(organizer, {
      title: 'Mumbai Conference',
      cityId: 'mumbai',
      startsAt: inDays(3)
    });
    await createEvent(organizer, {
      title: 'Online Webinar',
      eventType: 'ONLINE',
      startsAt: inDays(4)
    });
    await createEvent(organizer, {
      title: 'Kochi Hybrid Summit',
      eventType: 'HYBRID',
      cityId: 'kochi',
      startsAt: inDays(6)
    });
  });

  it('shows everything without a city', async () => {
    expect((await discover()).total).toBe(5);
    expect(titles(await discover({ includeOnline: 'false' }))).toEqual([
      'Bengaluru Hackathon',
      'Mumbai Conference',
      'Chennai Meetup',
      'Kochi Hybrid Summit'
    ]);
  });

  it('limits to the chosen city, plus events you can join online', async () => {
    expect(titles(await discover({ city: 'chennai' }))).toEqual([
      'Online Webinar',
      'Chennai Meetup',
      'Kochi Hybrid Summit'
    ]);
    expect(
      titles(await discover({ city: 'chennai', includeOnline: 'false' }))
    ).toEqual(['Chennai Meetup']);
  });

  it('widens to nearby cities within the radius', async () => {
    // Chennai → Bengaluru is about 290 km; Chennai → Mumbai about 1030 km.
    const near = await discover({
      city: 'chennai',
      radiusKm: 400,
      includeOnline: 'false'
    });
    expect(titles(near)).toEqual(['Bengaluru Hackathon', 'Chennai Meetup']);

    const tight = await discover({
      city: 'chennai',
      radiusKm: 250,
      includeOnline: 'false'
    });
    expect(titles(tight)).toEqual(['Chennai Meetup']);
  });

  it('sorts nearest first and reports the distance', async () => {
    const page = await discover({
      city: 'chennai',
      radiusKm: 1000,
      sort: 'nearest'
    });

    expect(page.items.map((event) => [event.title, event.distanceKm])).toEqual([
      ['Chennai Meetup', 0],
      ['Bengaluru Hackathon', expect.any(Number)],
      ['Kochi Hybrid Summit', expect.any(Number)],
      ['Online Webinar', null]
    ]);
    const bengaluru = page.items[1]!.distanceKm!;
    expect(bengaluru).toBeGreaterThan(270);
    expect(bengaluru).toBeLessThan(310);
  });

  it('rejects nearest without a city and out-of-range radii', async () => {
    const response = await request(app)
      .get('/api/events')
      .query({ sort: 'nearest', radiusKm: 5000, includeOnline: 'maybe' })
      .expect(400);

    expect(Object.keys(response.body.error.details.fields).sort()).toEqual([
      'includeOnline',
      'radiusKm'
    ]);
    const nearest = await request(app)
      .get('/api/events')
      .query({ sort: 'nearest' })
      .expect(400);
    expect(nearest.body.error.details.fields.sort).toBe(
      'Choose a city to sort by distance.'
    );
  });
});

describe('PATCH /api/auth/me/home-city', () => {
  it('saves, returns in the session and clears the home city', async () => {
    const attendee = await createUser('ATTENDEE');
    const save = (cityId: string | null) =>
      request(app)
        .patch('/api/auth/me/home-city')
        .set('Cookie', attendee.cookie)
        .send({ cityId });

    const saved = await save('kolkata').expect(200);
    expect(saved.body.data.homeCityId).toBe('kolkata');
    const session = await request(app)
      .get('/api/auth/session')
      .set('Cookie', attendee.cookie)
      .expect(200);
    expect(session.body.data.homeCityId).toBe('kolkata');

    const unknown = await save('gotham').expect(400);
    expect(unknown.body.error.details.fields.cityId).toBe(
      'Choose a city from the list.'
    );
    expect((await save(null).expect(200)).body.data.homeCityId).toBeNull();
  });

  it('requires a signed-in user', async () => {
    await request(app)
      .patch('/api/auth/me/home-city')
      .send({ cityId: 'pune' })
      .expect(401);
  });
});
