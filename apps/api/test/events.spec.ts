import { DateTime } from 'luxon';
import request from 'supertest';
import { pool } from '../src/db/pool';
import {
  app,
  createEvent,
  createUser,
  register,
  resetDatabase,
  validEventBody
} from './factories';

afterAll(() => pool.end());
beforeEach(resetDatabase);

describe('POST /api/events', () => {
  it('creates a draft event with the time zone applied', async () => {
    const organizer = await createUser('ORGANIZER');

    const response = await request(app)
      .post('/api/events')
      .set('Cookie', organizer.cookie)
      .send(validEventBody({ startsAtLocal: '2031-01-10T18:30' }))
      .expect(201);

    expect(response.body.data).toMatchObject({
      status: 'DRAFT',
      organizerId: organizer.id,
      timeZone: 'Asia/Kolkata',
      startsAt: '2031-01-10T13:00:00.000Z',
      startsAtLocal: '2031-01-10T18:30',
      capacity: 10,
      availablePlaces: 10
    });
  });

  it.each([
    [{ capacity: 0 }, 'capacity'],
    [{ capacity: -5 }, 'capacity'],
    [{ capacity: 2.5 }, 'capacity'],
    [{ title: '   ' }, 'title'],
    [{ timeZone: 'Not/AZone' }, 'timeZone'],
    [{ startsAtLocal: '2001-01-01T10:00', publish: true }, 'startsAtLocal']
  ])('rejects invalid input %o', async (override, field) => {
    const organizer = await createUser('ORGANIZER');

    const response = await request(app)
      .post('/api/events')
      .set('Cookie', organizer.cookie)
      .send(validEventBody(override))
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_FAILED');
    expect(response.body.error.details.fields).toHaveProperty(field);
  });

  it('returns readable messages when required fields are missing', async () => {
    const organizer = await createUser('ORGANIZER');

    const response = await request(app)
      .post('/api/events')
      .set('Cookie', organizer.cookie)
      .send({})
      .expect(400);

    expect(response.body.error.details.fields).toEqual({
      title: 'Title is required.',
      description: 'Description is required.',
      startsAtLocal: 'Start date and time is required.',
      timeZone: 'Time zone is required.',
      venue: 'Venue is required.',
      capacity: 'Capacity is required.',
      category: 'Choose a category.',
      cityId: 'Choose the city where the event happens.'
    });
  });

  it('reports only the time zone error for an invalid time zone', async () => {
    const organizer = await createUser('ORGANIZER');

    const response = await request(app)
      .post('/api/events')
      .set('Cookie', organizer.cookie)
      .send(validEventBody({ timeZone: 'Mars/Base' }))
      .expect(400);

    expect(response.body.error.details.fields).toEqual({
      timeZone: 'Choose a valid time zone.'
    });
  });

  it('forbids attendees from creating events', async () => {
    const attendee = await createUser('ATTENDEE');

    const response = await request(app)
      .post('/api/events')
      .set('Cookie', attendee.cookie)
      .send(validEventBody())
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('requires authentication', async () => {
    await request(app).post('/api/events').send(validEventBody()).expect(401);
  });
});

describe('ownership', () => {
  it("prevents an organizer from editing, publishing or canceling another organizer's event", async () => {
    const owner = await createUser('ORGANIZER');
    const intruder = await createUser('ORGANIZER');
    const eventId = await createEvent(owner, { status: 'DRAFT' });

    const edit = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Cookie', intruder.cookie)
      .send({ title: 'Hijacked' })
      .expect(404);
    await request(app)
      .post(`/api/events/${eventId}/publish`)
      .set('Cookie', intruder.cookie)
      .expect(404);
    await request(app)
      .post(`/api/events/${eventId}/cancel`)
      .set('Cookie', intruder.cookie)
      .expect(404);

    // Same answer as a missing event, so ids can't be probed.
    expect(edit.body.error.code).toBe('EVENT_NOT_FOUND');
    const { rows } = await pool.query(
      'SELECT title, status FROM events WHERE id = $1',
      [eventId]
    );
    expect(rows[0]).toEqual({ title: 'Factory event', status: 'DRAFT' });
  });

  it("prevents an organizer from reading another organizer's attendee list", async () => {
    const owner = await createUser('ORGANIZER');
    const intruder = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(owner);
    await register(eventId, attendee).expect(201);

    const response = await request(app)
      .get(`/api/organizer/events/${eventId}/attendees`)
      .set('Cookie', intruder.cookie)
      .expect(404);

    expect(response.body.error.code).toBe('EVENT_NOT_FOUND');
    expect(JSON.stringify(response.body)).not.toContain(attendee.email);
  });

  it('forbids attendees from reading attendee lists', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(owner);

    await request(app)
      .get(`/api/organizer/events/${eventId}/attendees`)
      .set('Cookie', attendee.cookie)
      .expect(403);
  });

  it('shows the owner their attendees with name, email and registration time', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE', 'Asha');
    const eventId = await createEvent(owner);
    await register(eventId, attendee).expect(201);

    const response = await request(app)
      .get(`/api/organizer/events/${eventId}/attendees`)
      .set('Cookie', owner.cookie)
      .expect(200);

    expect(response.body.data.attendees).toEqual([
      {
        registrationId: expect.any(String),
        attendeeId: attendee.id,
        name: 'Asha',
        email: attendee.email,
        registeredAt: expect.any(String),
        slotLabel: null
      }
    ]);
  });
});

describe('PATCH /api/events/:id capacity', () => {
  it('rejects reducing capacity below active registrations', async () => {
    const owner = await createUser('ORGANIZER');
    const eventId = await createEvent(owner, { capacity: 5 });
    const attendees = await Promise.all([
      createUser('ATTENDEE'),
      createUser('ATTENDEE'),
      createUser('ATTENDEE')
    ]);
    for (const attendee of attendees) {
      await register(eventId, attendee).expect(201);
    }

    const response = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Cookie', owner.cookie)
      .send({ capacity: 2 })
      .expect(409);

    expect(response.body.error.code).toBe('CAPACITY_BELOW_REGISTRATIONS');
    expect(response.body.error.details.registeredCount).toBe(3);
  });

  it('allows reducing capacity down to exactly the active registrations', async () => {
    const owner = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(owner, { capacity: 5 });
    await register(eventId, attendee).expect(201);

    const response = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Cookie', owner.cookie)
      .send({ capacity: 1 })
      .expect(200);

    expect(response.body.data).toMatchObject({
      capacity: 1,
      availablePlaces: 0,
      isRegistrationOpen: false
    });
  });

  it('does not allow editing a canceled event', async () => {
    const owner = await createUser('ORGANIZER');
    const eventId = await createEvent(owner, { status: 'CANCELED' });

    const response = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Cookie', owner.cookie)
      .send({ title: 'Back again' })
      .expect(409);

    expect(response.body.error.code).toBe('EVENT_NOT_EDITABLE');
  });
});

describe('status transitions', () => {
  it('publishes a draft and cancels a published event', async () => {
    const owner = await createUser('ORGANIZER');
    const eventId = await createEvent(owner, { status: 'DRAFT' });

    const published = await request(app)
      .post(`/api/events/${eventId}/publish`)
      .set('Cookie', owner.cookie)
      .expect(200);
    const canceled = await request(app)
      .post(`/api/events/${eventId}/cancel`)
      .set('Cookie', owner.cookie)
      .expect(200);
    const again = await request(app)
      .post(`/api/events/${eventId}/publish`)
      .set('Cookie', owner.cookie)
      .expect(409);

    expect(published.body.data.status).toBe('PUBLISHED');
    expect(canceled.body.data.status).toBe('CANCELED');
    expect(again.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });
});

describe('GET /api/events (public discovery)', () => {
  it('lists only published upcoming events', async () => {
    const owner = await createUser('ORGANIZER');
    const published = await createEvent(owner, { status: 'PUBLISHED' });
    await createEvent(owner, { status: 'DRAFT' });
    await createEvent(owner, { status: 'CANCELED' });
    await createEvent(owner, {
      status: 'PUBLISHED',
      startsAt: DateTime.now().minus({ hours: 1 }).toJSDate()
    });

    const response = await request(app).get('/api/events').expect(200);

    expect(
      response.body.data.items.map((event: { id: string }) => event.id)
    ).toEqual([published]);
    expect(response.body.data.total).toBe(1);
  });

  it('hides drafts from everyone but their owner', async () => {
    const owner = await createUser('ORGANIZER');
    const other = await createUser('ORGANIZER');
    const draft = await createEvent(owner, { status: 'DRAFT' });

    await request(app).get(`/api/events/${draft}`).expect(404);
    await request(app)
      .get(`/api/events/${draft}`)
      .set('Cookie', other.cookie)
      .expect(404);
    await request(app)
      .get(`/api/events/${draft}`)
      .set('Cookie', owner.cookie)
      .expect(200);
  });
});
