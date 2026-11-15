import { DateTime } from 'luxon';
import request from 'supertest';
import { pool } from '../src/db/pool';
import {
  app,
  createEvent,
  createUser,
  futureLocal,
  register,
  resetDatabase,
  type TestUser,
  validEventBody
} from './factories';

afterAll(() => pool.end());
beforeEach(resetDatabase);

const hoursFromNow = (hours: number) =>
  DateTime.now().plus({ hours }).toJSDate();

const discoverIds = async () =>
  (await request(app).get('/api/events').expect(200)).body.data.items.map(
    (event: { id: string }) => event.id
  );

const get = (id: string, cookie?: string) => {
  const pending = request(app).get(`/api/events/${id}`);
  return cookie ? pending.set('Cookie', cookie) : pending;
};

/** Discover results as seen by a visitor or a signed-in user. */
const listAs = async (cookie?: string) => {
  const pending = request(app).get('/api/events');
  const response = await (
    cookie ? pending.set('Cookie', cookie) : pending
  ).expect(200);
  return response.body.data.items as { expiresAt: string | null }[];
};

const auditActions = async () =>
  (
    await pool.query<{ action: string; metadata: Record<string, unknown> }>(
      'SELECT action, metadata FROM admin_audit_log ORDER BY created_at'
    )
  ).rows;

describe('scheduled publishing', () => {
  let organizer: TestUser;
  beforeEach(async () => {
    organizer = await createUser('ORGANIZER');
  });

  it('keeps a scheduled event hidden until its go-live time', async () => {
    const publishAtLocal = futureLocal(2, 'Asia/Kolkata');
    const created = await request(app)
      .post('/api/events')
      .set('Cookie', organizer.cookie)
      .send(validEventBody({ publish: true, publishAtLocal }))
      .expect(201);
    const { id } = created.body.data;

    expect(created.body.data).toMatchObject({
      status: 'PUBLISHED',
      phase: 'SCHEDULED',
      publishAtLocal,
      isRegistrationOpen: false
    });
    expect(await discoverIds()).toEqual([]);
    await get(id).expect(404);
    const attendee = await createUser('ATTENDEE');
    const blocked = await register(id, attendee).expect(404);
    expect(blocked.body.error.code).toBe('EVENT_NOT_FOUND');
    const admin = await createUser('ADMIN');
    expect((await get(id, admin.cookie).expect(200)).body.data.phase).toBe(
      'SCHEDULED'
    );

    // The clock passes the go-live time: no job needed.
    await pool.query(
      "UPDATE events SET publish_at = now() - interval '1 minute' WHERE id = $1",
      [id]
    );
    expect(await discoverIds()).toEqual([id]);
    expect((await get(id).expect(200)).body.data.phase).toBe('LIVE');
    await register(id, attendee).expect(201);
  });

  it('checks go-live and listing-end times against the event', async () => {
    const send = (overrides: Record<string, unknown>) =>
      request(app)
        .post('/api/events')
        .set('Cookie', organizer.cookie)
        .send(
          validEventBody({
            timeZone: 'UTC',
            startsAtLocal: futureLocal(5),
            ...overrides
          })
        )
        .expect(400);

    const past = await send({ publishAtLocal: '2020-01-01T10:00' });
    expect(past.body.error.details.fields.publishAtLocal).toBe(
      'The go-live time must be in the future.'
    );
    const afterStart = await send({
      publishAtLocal: futureLocal(6),
      expiresAtLocal: futureLocal(8)
    });
    expect(afterStart.body.error.details.fields).toEqual({
      publishAtLocal: 'The go-live time must be before the event starts.',
      expiresAtLocal: 'The listing must end no later than the event start.'
    });
    const beforeGoLive = await send({
      publishAtLocal: futureLocal(3),
      expiresAtLocal: futureLocal(2)
    });
    expect(beforeGoLive.body.error.details.fields.expiresAtLocal).toBe(
      'The listing must end after the go-live time.'
    );
  });

  it("won't reschedule an event that is already live", async () => {
    const id = await createEvent(organizer);
    const response = await request(app)
      .patch(`/api/events/${id}`)
      .set('Cookie', organizer.cookie)
      .send({ publishAtLocal: futureLocal(1) })
      .expect(400);
    expect(response.body.error.details.fields.publishAtLocal).toMatch(
      /already live/
    );
  });
});

describe('listing expiry', () => {
  it('removes an expired event from Discover and closes registration', async () => {
    const organizer = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const id = await createEvent(organizer, { expiresAt: hoursFromNow(-1) });

    expect(await discoverIds()).toEqual([]);
    const page = (await get(id).expect(200)).body.data;
    expect(page).toMatchObject({ phase: 'EXPIRED', isRegistrationOpen: false });
    const closed = await register(id, attendee).expect(409);
    expect(closed.body.error.message).toBe(
      'Registration for this event has closed.'
    );
    const cities = (await request(app).get('/api/cities').expect(200)).body
      .data;
    expect(
      cities.find((city: { id: string }) => city.id === 'chennai')
        .upcomingEventCount
    ).toBe(0);

    // Extending the listing brings it back.
    await request(app)
      .patch(`/api/events/${id}`)
      .set('Cookie', organizer.cookie)
      .send({ expiresAtLocal: futureLocal(3) })
      .expect(200);
    expect(await discoverIds()).toEqual([id]);
  });

  it('shows go-live and expiry times only to the organizer and admins', async () => {
    const organizer = await createUser('ORGANIZER');
    const id = await createEvent(organizer, { expiresAt: hoursFromNow(48) });

    const visitor = (await get(id).expect(200)).body.data;
    expect(visitor).toMatchObject({ expiresAt: null, expiresAtLocal: null });
    const [listed] = await listAs();
    expect(listed!.expiresAt).toBeNull();

    const owner = (await get(id, organizer.cookie).expect(200)).body.data;
    expect(owner.expiresAt).not.toBeNull();
    const [ownListing] = await listAs(organizer.cookie);
    expect(ownListing!.expiresAt).toBe(owner.expiresAt);
    const otherOrganizer = await createUser('ORGANIZER');
    const [otherListing] = await listAs(otherOrganizer.cookie);
    expect(otherListing!.expiresAt).toBeNull();
    const admin = await createUser('ADMIN');
    expect(
      (await get(id, admin.cookie).expect(200)).body.data.expiresAtLocal
    ).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe('admins managing any event', () => {
  it('lets an admin edit, unpublish and publish, and audits each step', async () => {
    const organizer = await createUser('ORGANIZER');
    const admin = await createUser('ADMIN');
    const id = await createEvent(organizer, { title: 'Original title' });

    await request(app)
      .patch(`/api/events/${id}`)
      .set('Cookie', admin.cookie)
      .send({ title: 'Fixed title', expiresAtLocal: futureLocal(2) })
      .expect(200);
    const unpublished = await request(app)
      .post(`/api/events/${id}/unpublish`)
      .set('Cookie', admin.cookie)
      .expect(200);
    expect(unpublished.body.data).toMatchObject({
      status: 'DRAFT',
      phase: 'DRAFT'
    });
    await request(app)
      .post(`/api/events/${id}/publish`)
      .set('Cookie', admin.cookie)
      .expect(200);

    // The editor sees who touched the event last.
    const reloaded = await request(app)
      .get(`/api/events/${id}`)
      .set('Cookie', organizer.cookie)
      .expect(200);
    expect(reloaded.body.data.lastEditedBy).toEqual({
      id: admin.id,
      name: admin.name
    });
    const visitor = await request(app).get(`/api/events/${id}`).expect(200);
    expect(visitor.body.data.lastEditedBy).toBeNull();

    const actions = await auditActions();
    expect(actions.map((entry) => entry.action)).toEqual([
      'EDIT_EVENT',
      'UNPUBLISH_EVENT',
      'PUBLISH_EVENT'
    ]);
    const [edit] = actions;
    expect(edit!.metadata).toMatchObject({
      title: 'Original title',
      organizerId: organizer.id,
      fields: ['expiresAtLocal', 'title']
    });
  });

  it("still hides one organizer's events from another, and doesn't audit owners", async () => {
    const owner = await createUser('ORGANIZER');
    const other = await createUser('ORGANIZER');
    const id = await createEvent(owner, { status: 'DRAFT' });

    await request(app)
      .patch(`/api/events/${id}`)
      .set('Cookie', other.cookie)
      .send({ title: 'Hijack' })
      .expect(404);
    await request(app)
      .post(`/api/events/${id}/publish`)
      .set('Cookie', other.cookie)
      .expect(404);
    await request(app)
      .post(`/api/events/${id}/publish`)
      .set('Cookie', owner.cookie)
      .expect(200);
    expect(await auditActions()).toEqual([]);
  });

  it('refuses to unpublish once people have registered', async () => {
    const organizer = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const id = await createEvent(organizer);
    await register(id, attendee).expect(201);

    const response = await request(app)
      .post(`/api/events/${id}/unpublish`)
      .set('Cookie', organizer.cookie)
      .expect(409);
    expect(response.body.error.code).toBe('EVENT_HAS_REGISTRATIONS');
  });

  it("won't publish a draft whose listing has already ended", async () => {
    const organizer = await createUser('ORGANIZER');
    const id = await createEvent(organizer, {
      status: 'DRAFT',
      expiresAt: hoursFromNow(-2)
    });
    const response = await request(app)
      .post(`/api/events/${id}/publish`)
      .set('Cookie', organizer.cookie)
      .expect(400);
    expect(response.body.error.details.fields.expiresAtLocal).toMatch(
      /listing end time has passed/
    );
  });
});

describe('start times in the past', () => {
  it('lets a draft keep a past start time, and edit it', async () => {
    const organizer = await createUser('ORGANIZER');
    const created = await request(app)
      .post('/api/events')
      .set('Cookie', organizer.cookie)
      .send(validEventBody({ startsAtLocal: '2001-01-01T10:00' }))
      .expect(201);
    const { id } = created.body.data;

    await request(app)
      .patch(`/api/events/${id}`)
      .set('Cookie', organizer.cookie)
      .send({ title: 'Renamed draft' })
      .expect(200);
  });

  it('points at the start time when publishing a past draft', async () => {
    const organizer = await createUser('ORGANIZER');
    const id = await createEvent(organizer, {
      status: 'DRAFT',
      startsAt: hoursFromNow(-1)
    });
    const response = await request(app)
      .post(`/api/events/${id}/publish`)
      .set('Cookie', organizer.cookie)
      .expect(400);
    expect(response.body.error.details.fields.startsAtLocal).toMatch(
      /start time has passed/
    );
  });

  it('refuses to move a published event into the past', async () => {
    const organizer = await createUser('ORGANIZER');
    const id = await createEvent(organizer, { startsAt: hoursFromNow(48) });
    const response = await request(app)
      .patch(`/api/events/${id}`)
      .set('Cookie', organizer.cookie)
      .send({ startsAtLocal: '2001-01-01T10:00', timeZone: 'UTC' })
      .expect(400);
    expect(response.body.error.details.fields.startsAtLocal).toBe(
      'Start time must be in the future.'
    );
  });
});
