import request from 'supertest';
import { pool } from '../src/db/pool';
import {
  app,
  createEvent,
  createUser,
  resetDatabase,
  TEST_VENUE_PIN,
  type TestUser,
  validEventBody
} from './factories';

afterAll(() => pool.end());
beforeEach(resetDatabase);

const PIN_REQUIRED = 'Pin the venue on the map before publishing.';
const MARINA = { latitude: 13.05, longitude: 80.2824 };

const fieldsOf = (response: request.Response) =>
  response.body.error.details.fields as Record<string, string>;

describe('venue map pin', () => {
  let organizer: TestUser;
  beforeEach(async () => {
    organizer = await createUser('ORGANIZER');
  });

  const create = (body: Record<string, unknown>) =>
    request(app)
      .post('/api/events')
      .set('Cookie', organizer.cookie)
      .send(validEventBody(body));

  const patch = (id: string, body: Record<string, unknown>) =>
    request(app)
      .patch(`/api/events/${id}`)
      .set('Cookie', organizer.cookie)
      .send(body);

  const publish = (id: string) =>
    request(app)
      .post(`/api/events/${id}/publish`)
      .set('Cookie', organizer.cookie);

  it('stores the pin and returns it to everyone', async () => {
    const created = await create({ publish: true }).expect(201);
    expect(created.body.data.venueLocation).toEqual(TEST_VENUE_PIN);

    const visitor = await request(app)
      .get(`/api/events/${created.body.data.id}`)
      .expect(200);
    expect(visitor.body.data.venueLocation).toEqual(TEST_VENUE_PIN);
  });

  it('lets a draft be saved without a pin, but not published', async () => {
    const draft = await create({ venueLocation: null }).expect(201);
    expect(draft.body.data.venueLocation).toBeNull();

    const refused = await publish(draft.body.data.id).expect(400);
    expect(fieldsOf(refused)).toEqual({ venueLocation: PIN_REQUIRED });

    await patch(draft.body.data.id, { venueLocation: MARINA }).expect(200);
    const published = await publish(draft.body.data.id).expect(200);
    expect(published.body.data).toMatchObject({
      status: 'PUBLISHED',
      venueLocation: MARINA
    });
  });

  it('refuses to create a published in-person or hybrid event without a pin', async () => {
    const inPerson = await create({
      publish: true,
      venueLocation: null
    }).expect(400);
    expect(fieldsOf(inPerson).venueLocation).toBe(PIN_REQUIRED);

    const hybrid = await create({
      publish: true,
      eventType: 'HYBRID',
      onlineUrl: 'https://meet.example.com/hybrid',
      venueLocation: undefined
    }).expect(400);
    expect(fieldsOf(hybrid).venueLocation).toBe(PIN_REQUIRED);
  });

  it('never needs or keeps a pin for online events', async () => {
    const created = await create({
      publish: true,
      eventType: 'ONLINE',
      onlineUrl: 'https://meet.example.com/online',
      venue: '',
      cityId: null,
      venueLocation: MARINA
    }).expect(201);
    expect(created.body.data.venueLocation).toBeNull();
  });

  it('rejects out-of-range coordinates', async () => {
    const response = await create({
      venueLocation: { latitude: 91, longitude: 80 }
    }).expect(400);
    expect(fieldsOf(response)['venueLocation.latitude']).toBe(
      'Latitude must be between -90 and 90.'
    );
  });

  it('keeps a published event from losing its pin', async () => {
    const id = await createEvent(organizer);
    const refused = await patch(id, { venueLocation: null }).expect(400);
    expect(fieldsOf(refused)).toEqual({ venueLocation: PIN_REQUIRED });

    const moved = await patch(id, { venueLocation: MARINA }).expect(200);
    expect(moved.body.data.venueLocation).toEqual(MARINA);
  });

  it('still lets older published events without a pin be edited', async () => {
    const id = await createEvent(organizer, { venueLocation: null });
    const edited = await patch(id, { title: 'New title' }).expect(200);
    expect(edited.body.data).toMatchObject({
      title: 'New title',
      venueLocation: null
    });
  });

  it('drops the pin when an event becomes online-only', async () => {
    const id = await createEvent(organizer, { status: 'DRAFT' });
    const online = await patch(id, {
      eventType: 'ONLINE',
      onlineUrl: 'https://meet.example.com/moved'
    }).expect(200);
    expect(online.body.data.venueLocation).toBeNull();
  });
});
