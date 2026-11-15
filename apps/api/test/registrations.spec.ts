import { DateTime } from 'luxon';
import request from 'supertest';
import { pool } from '../src/db/pool';
import {
  app,
  createEvent,
  createUser,
  getEventCounts,
  register,
  resetDatabase
} from './factories';

afterAll(() => pool.end());
beforeEach(resetDatabase);

describe('POST /api/events/:id/registrations', () => {
  it('registers an attendee and returns updated availability', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(owner, { capacity: 3 });

    const response = await register(eventId, attendee).expect(201);

    expect(response.body.data).toMatchObject({
      status: 'ACTIVE',
      event: { id: eventId, registeredCount: 1, availablePlaces: 2 }
    });
  });

  it('rejects a second active registration by the same attendee', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(owner, { capacity: 3 });
    await register(eventId, attendee).expect(201);

    const response = await register(eventId, attendee).expect(409);

    expect(response.body.error.code).toBe('ALREADY_REGISTERED');
    // The rolled-back attempt must not consume a place.
    expect(await getEventCounts(eventId)).toEqual({
      registeredCount: 1,
      activeRegistrations: 1
    });
  });

  it('reports ALREADY_REGISTERED, not EVENT_FULL, when the attendee already holds a place in a full event', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(owner, { capacity: 1 });
    await register(eventId, attendee).expect(201);

    const response = await register(eventId, attendee).expect(409);

    expect(response.body.error.code).toBe('ALREADY_REGISTERED');
    expect(await getEventCounts(eventId)).toEqual({
      registeredCount: 1,
      activeRegistrations: 1
    });
  });

  it('rejects registration when the event is full', async () => {
    const owner = await createUser('ORGANIZER');
    const first = await createUser('ATTENDEE');
    const second = await createUser('ATTENDEE');
    const eventId = await createEvent(owner, { capacity: 1 });
    await register(eventId, first).expect(201);

    const response = await register(eventId, second).expect(409);

    expect(response.body.error).toEqual({
      code: 'EVENT_FULL',
      message: 'This event is fully booked.'
    });
  });

  it.each([
    ['CANCELED', 409, 'EVENT_CANCELED'],
    ['DRAFT', 404, 'EVENT_NOT_FOUND']
  ] as const)(
    'rejects registration for a %s event',
    async (status, httpStatus, code) => {
      const owner = await createUser('ORGANIZER');
      const attendee = await createUser('ATTENDEE');
      const eventId = await createEvent(owner, { status });

      const response = await register(eventId, attendee).expect(httpStatus);

      expect(response.body.error.code).toBe(code);
    }
  );

  it('rejects registration after the event has started', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(owner, {
      startsAt: DateTime.now().minus({ minutes: 1 }).toJSDate()
    });

    const response = await register(eventId, attendee).expect(409);

    expect(response.body.error.code).toBe('EVENT_STARTED');
  });

  it('forbids organizers from registering', async () => {
    const owner = await createUser('ORGANIZER');
    const eventId = await createEvent(owner);

    await register(eventId, owner).expect(403);
  });
});

describe('POST /api/registrations/:id/cancel', () => {
  it('releases the place so another attendee can take it', async () => {
    const owner = await createUser('ORGANIZER');
    const first = await createUser('ATTENDEE');
    const second = await createUser('ATTENDEE');
    const eventId = await createEvent(owner, { capacity: 1 });
    const registration = await register(eventId, first).expect(201);
    await register(eventId, second).expect(409);

    const canceled = await request(app)
      .post(`/api/registrations/${registration.body.data.id}/cancel`)
      .set('Cookie', first.cookie)
      .expect(200);

    expect(canceled.body.data).toMatchObject({
      status: 'CANCELED',
      event: { availablePlaces: 1 }
    });
    await register(eventId, second).expect(201);
    expect(await getEventCounts(eventId)).toEqual({
      registeredCount: 1,
      activeRegistrations: 1
    });
  });

  it('allows re-registering after canceling', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(owner);
    const registration = await register(eventId, attendee).expect(201);
    await request(app)
      .post(`/api/registrations/${registration.body.data.id}/cancel`)
      .set('Cookie', attendee.cookie)
      .expect(200);

    await register(eventId, attendee).expect(201);

    const mine = await request(app)
      .get('/api/me/registrations')
      .set('Cookie', attendee.cookie)
      .expect(200);
    expect(mine.body.data).toHaveLength(1);
    expect(mine.body.data[0].status).toBe('ACTIVE');
  });

  it('does not release a place twice', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const other = await createUser('ATTENDEE');
    const eventId = await createEvent(owner, { capacity: 2 });
    const registration = await register(eventId, attendee).expect(201);
    await register(eventId, other).expect(201);
    const path = `/api/registrations/${registration.body.data.id}/cancel`;

    await request(app).post(path).set('Cookie', attendee.cookie).expect(200);
    const second = await request(app)
      .post(path)
      .set('Cookie', attendee.cookie)
      .expect(409);

    expect(second.body.error.code).toBe('REGISTRATION_NOT_ACTIVE');
    expect((await getEventCounts(eventId)).registeredCount).toBe(1);
  });

  it("hides someone else's registration (404) and leaves it active", async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const intruder = await createUser('ATTENDEE');
    const eventId = await createEvent(owner);
    const registration = await register(eventId, attendee).expect(201);

    await request(app)
      .post(`/api/registrations/${registration.body.data.id}/cancel`)
      .set('Cookie', intruder.cookie)
      .expect(404);

    expect((await getEventCounts(eventId)).activeRegistrations).toBe(1);
  });
});

describe('concurrency', () => {
  it('never exceeds capacity when many attendees race for the last places', async () => {
    const capacity = 3;
    const contenders = 30;
    const owner = await createUser('ORGANIZER');
    const eventId = await createEvent(owner, { capacity });
    const attendees = await Promise.all(
      Array.from({ length: contenders }, () => createUser('ATTENDEE'))
    );

    // All requests are in flight at the same time on separate connections.
    const responses = await Promise.all(
      attendees.map((attendee) => register(eventId, attendee))
    );

    const created = responses.filter((response) => response.status === 201);
    const full = responses.filter(
      (response) => response.body.error?.code === 'EVENT_FULL'
    );
    expect(created).toHaveLength(capacity);
    expect(full).toHaveLength(contenders - capacity);
    expect(await getEventCounts(eventId)).toEqual({
      registeredCount: capacity,
      activeRegistrations: capacity
    });
  });

  it('lets only one of many simultaneous requests from the same attendee succeed', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(owner, { capacity: 10 });

    const responses = await Promise.all(
      Array.from({ length: 10 }, () => register(eventId, attendee))
    );

    expect(responses.filter((r) => r.status === 201)).toHaveLength(1);
    expect(
      responses.filter((r) => r.body.error?.code === 'ALREADY_REGISTERED')
    ).toHaveLength(9);
    expect(await getEventCounts(eventId)).toEqual({
      registeredCount: 1,
      activeRegistrations: 1
    });
  });

  it('cannot reduce capacity below registrations that land concurrently', async () => {
    const owner = await createUser('ORGANIZER');
    const eventId = await createEvent(owner, { capacity: 10 });
    const attendees = await Promise.all(
      Array.from({ length: 8 }, () => createUser('ATTENDEE'))
    );

    await Promise.all([
      ...attendees.map((attendee) => register(eventId, attendee)),
      request(app)
        .patch(`/api/events/${eventId}`)
        .set('Cookie', owner.cookie)
        .send({ capacity: 4 })
    ]);

    const { rows } = await pool.query(
      'SELECT capacity, registered_count FROM events WHERE id = $1',
      [eventId]
    );
    expect(rows[0].registered_count).toBeLessThanOrEqual(rows[0].capacity);
    expect((await getEventCounts(eventId)).activeRegistrations).toBe(
      rows[0].registered_count
    );
  });
});
