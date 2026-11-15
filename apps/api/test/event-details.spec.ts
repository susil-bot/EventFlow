import request from 'supertest';
import { pool } from '../src/db/pool';
import {
  app,
  createSlottedEvent,
  createUser,
  getEventCounts,
  getSlotCounts,
  register,
  resetDatabase,
  slotBody,
  type TestUser,
  validEventBody
} from './factories';
import { makeImage } from './images';

afterAll(() => pool.end());
beforeEach(resetDatabase);

// Smallest valid files of each kind (only the signature bytes matter).
let PNG: Buffer;
let JPEG: Buffer;
beforeAll(async () => {
  PNG = await makeImage('png');
  JPEG = await makeImage('jpeg');
});

const createEvent = (organizer: TestUser, body: Record<string, unknown>) =>
  request(app)
    .post('/api/events')
    .set('Cookie', organizer.cookie)
    .send(validEventBody(body));

const uploadImage = (user: TestUser, bytes: Buffer, type = 'image/png') =>
  request(app)
    .post('/api/uploads/images')
    .set('Cookie', user.cookie)
    .set('Content-Type', type)
    .send(bytes);

describe('event type, category, slug and social links', () => {
  it('stores the new fields and generates a slug from the title', async () => {
    const organizer = await createUser('ORGANIZER');

    const response = await createEvent(organizer, {
      title: 'React Chennai — Meetup!',
      eventType: 'HYBRID',
      category: 'MEETUP',
      onlineUrl: 'https://zoom.us/j/123',
      socialLinks: [
        { platform: 'LINKEDIN', url: 'https://www.linkedin.com/company/x' },
        { platform: 'WEBSITE', url: 'https://example.com' }
      ]
    }).expect(201);

    expect(response.body.data).toMatchObject({
      eventType: 'HYBRID',
      category: 'MEETUP',
      slug: 'react-chennai-meetup',
      onlineUrl: 'https://zoom.us/j/123',
      socialLinks: [
        { platform: 'LINKEDIN', url: 'https://www.linkedin.com/company/x' },
        { platform: 'WEBSITE', url: 'https://example.com' }
      ],
      images: [],
      slots: []
    });
  });

  it('stores a ticket price in paise, free by default, and edits it', async () => {
    const organizer = await createUser('ORGANIZER');

    const free = await createEvent(organizer, {}).expect(201);
    expect(free.body.data.price).toEqual({ amountMinor: 0, currency: 'INR' });

    const paid = await createEvent(organizer, {
      category: 'COMEDY_SHOW',
      priceMinor: 39_900
    }).expect(201);
    expect(paid.body.data).toMatchObject({
      category: 'COMEDY_SHOW',
      price: { amountMinor: 39_900 }
    });

    const edited = await request(app)
      .patch(`/api/events/${paid.body.data.id}`)
      .set('Cookie', organizer.cookie)
      .send({ priceMinor: 49_900 })
      .expect(200);
    expect(edited.body.data.price.amountMinor).toBe(49_900);

    const invalid = await createEvent(organizer, {
      priceMinor: 12.5
    }).expect(400);
    expect(invalid.body.error.details.fields.priceMinor).toBe(
      'Price must be a whole number of paise.'
    );
    await createEvent(organizer, { priceMinor: -1 }).expect(400);
  });

  it('opens an event by its slug and rejects a slug that is taken', async () => {
    const organizer = await createUser('ORGANIZER');
    await createEvent(organizer, {
      slug: 'chennai-js',
      publish: true
    }).expect(201);

    const bySlug = await request(app).get('/api/events/chennai-js').expect(200);
    expect(bySlug.body.data.slug).toBe('chennai-js');

    const taken = await createEvent(organizer, { slug: 'chennai-js' }).expect(
      409
    );
    expect(taken.body.error.code).toBe('SLUG_TAKEN');
    expect(taken.body.error.details.fields).toHaveProperty('slug');
  });

  it('gives a second event with the same title its own slug', async () => {
    const organizer = await createUser('ORGANIZER');
    const first = await createEvent(organizer, { title: 'Same Title' });
    const second = await createEvent(organizer, { title: 'Same Title' });

    expect(first.body.data.slug).toBe('same-title');
    expect(second.body.data.slug).toMatch(/^same-title-[0-9a-f]{6}$/);
  });

  it.each([
    [{ category: 'DISCO' }, 'category'],
    [{ eventType: 'ONLINE' }, 'onlineUrl'],
    [{ eventType: 'IN_PERSON', venue: '' }, 'venue'],
    [{ slug: 'Not A Slug!' }, 'slug'],
    [
      { onlineUrl: 'http://insecure.example', eventType: 'ONLINE' },
      'onlineUrl'
    ],
    [
      { socialLinks: [{ platform: 'LINKEDIN', url: 'https://evil.example' }] },
      'socialLinks.0.url'
    ],
    [
      {
        socialLinks: [
          { platform: 'X', url: 'https://x.com/a' },
          { platform: 'X', url: 'https://x.com/b' }
        ]
      },
      'socialLinks'
    ]
  ])('rejects invalid input %o', async (override, field) => {
    const organizer = await createUser('ORGANIZER');

    const response = await createEvent(organizer, override).expect(400);

    // Field keys contain dots ("socialLinks.0.url"), so compare keys.
    expect(Object.keys(response.body.error.details.fields)).toContain(field);
  });

  it('lets an online event skip the venue', async () => {
    const organizer = await createUser('ORGANIZER');

    const response = await createEvent(organizer, {
      eventType: 'ONLINE',
      venue: '',
      onlineUrl: 'https://meet.example.com/abc'
    }).expect(201);

    expect(response.body.data.venue).toBe('Online');
  });

  it('shows the meeting link only to the owner and to attendees with a place', async () => {
    const organizer = await createUser('ORGANIZER');
    const registered = await createUser('ATTENDEE');
    const stranger = await createUser('ATTENDEE');
    const created = await createEvent(organizer, {
      eventType: 'ONLINE',
      venue: '',
      onlineUrl: 'https://meet.example.com/secret',
      publish: true
    }).expect(201);
    const eventId = created.body.data.id as string;
    await register(eventId, registered).expect(201);

    const linkFor = async (cookie?: string) => {
      const call = request(app).get(`/api/events/${eventId}`);
      const response = await (cookie ? call.set('Cookie', cookie) : call);
      return response.body.data.onlineUrl as string | null;
    };

    expect(await linkFor()).toBeNull();
    expect(await linkFor(stranger.cookie)).toBeNull();
    expect(await linkFor(registered.cookie)).toBe(
      'https://meet.example.com/secret'
    );
    expect(await linkFor(organizer.cookie)).toBe(
      'https://meet.example.com/secret'
    );

    const listing = await request(app).get('/api/events').expect(200);
    expect(listing.body.data.items[0].onlineUrl).toBeNull();
  });
});

describe('POST /api/uploads/images', () => {
  it('stores an image, serves it and attaches it to an event in order', async () => {
    const organizer = await createUser('ORGANIZER');
    const cover = await uploadImage(organizer, PNG).expect(201);
    const second = await uploadImage(organizer, JPEG, 'image/jpeg').expect(201);
    expect(cover.body.data.url).toMatch(/^\/uploads\/[0-9a-f-]+\.png$/);
    expect(second.body.data.url).toMatch(/\.jpg$/);

    const served = await request(app).get(cover.body.data.url).expect(200);
    expect(served.headers['content-type']).toBe('image/png');

    const event = await createEvent(organizer, {
      imageIds: [cover.body.data.id, second.body.data.id]
    }).expect(201);
    expect(event.body.data.images).toEqual([
      { id: cover.body.data.id, url: cover.body.data.url },
      { id: second.body.data.id, url: second.body.data.url }
    ]);

    const reordered = await request(app)
      .patch(`/api/events/${event.body.data.id}`)
      .set('Cookie', organizer.cookie)
      .send({ imageIds: [second.body.data.id] })
      .expect(200);
    expect(reordered.body.data.images).toEqual([second.body.data]);
  });

  it('detects the type from the bytes, not the header', async () => {
    const organizer = await createUser('ORGANIZER');

    const response = await uploadImage(
      organizer,
      Buffer.from('<script>alert(1)</script>'),
      'image/png'
    ).expect(415);

    expect(response.body.error.code).toBe('UNSUPPORTED_IMAGE');
  });

  it('rejects files over the size limit', async () => {
    const organizer = await createUser('ORGANIZER');
    const huge = Buffer.concat([PNG, Buffer.alloc(6 * 1024 * 1024)]);

    const response = await uploadImage(organizer, huge).expect(413);

    expect(response.body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('only lets organizers upload', async () => {
    const attendee = await createUser('ATTENDEE');

    await uploadImage(attendee, PNG).expect(403);
    await request(app)
      .post('/api/uploads/images')
      .set('Content-Type', 'image/png')
      .send(PNG)
      .expect(401);
  });

  it("refuses to attach another organizer's image", async () => {
    const owner = await createUser('ORGANIZER');
    const other = await createUser('ORGANIZER');
    const upload = await uploadImage(other, PNG).expect(201);

    const response = await createEvent(owner, {
      imageIds: [upload.body.data.id]
    }).expect(400);

    expect(response.body.error.details.fields).toHaveProperty('imageIds');
  });
});

describe('time slots', () => {
  it('derives start time and capacity from the slots', async () => {
    const organizer = await createUser('ORGANIZER');

    const event = await createSlottedEvent(organizer, [
      slotBody('Afternoon', { hour: 14, capacity: 3 }),
      slotBody('Morning', { hour: 9, capacity: 2 })
    ]);

    expect(event.capacity).toBe(5);
    expect(event.slots.map((slot) => slot.label)).toEqual([
      'Morning',
      'Afternoon'
    ]);
  });

  it('requires a slot, then fills that slot only', async () => {
    const organizer = await createUser('ORGANIZER');
    const [first, second, third] = await Promise.all([
      createUser('ATTENDEE'),
      createUser('ATTENDEE'),
      createUser('ATTENDEE')
    ]);
    const event = await createSlottedEvent(organizer, [
      slotBody('Morning', { hour: 9, capacity: 1 }),
      slotBody('Evening', { hour: 18, capacity: 5 })
    ]);
    const [morning, evening] = event.slots;

    const missing = await register(event.id, first!).expect(400);
    expect(missing.body.error.code).toBe('SLOT_REQUIRED');

    const ok = await register(event.id, first!, {
      slotId: morning!.id
    }).expect(201);
    expect(ok.body.data.slot).toMatchObject({
      id: morning!.id,
      label: 'Morning',
      availablePlaces: 0
    });

    const full = await register(event.id, second!, {
      slotId: morning!.id
    }).expect(409);
    expect(full.body.error.code).toBe('SLOT_FULL');

    await register(event.id, third!, { slotId: evening!.id }).expect(201);
    expect(await getEventCounts(event.id)).toEqual({
      registeredCount: 2,
      activeRegistrations: 2
    });
    expect(await getSlotCounts(morning!.id)).toEqual({
      registeredCount: 1,
      activeRegistrations: 1
    });
  });

  it('rejects a slot that belongs to another event', async () => {
    const organizer = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const event = await createSlottedEvent(organizer, [slotBody('A')]);
    const other = await createSlottedEvent(organizer, [slotBody('B')]);

    const response = await register(event.id, attendee, {
      slotId: other.slots[0]!.id
    }).expect(404);

    expect(response.body.error.code).toBe('SLOT_NOT_FOUND');
    expect((await getEventCounts(event.id)).registeredCount).toBe(0);
  });

  it('never overfills a slot when many attendees race for it', async () => {
    const organizer = await createUser('ORGANIZER');
    const event = await createSlottedEvent(organizer, [
      slotBody('Tiny', { capacity: 2 }),
      slotBody('Big', { hour: 15, capacity: 50 })
    ]);
    const tiny = event.slots[0]!;
    const attendees = await Promise.all(
      Array.from({ length: 20 }, () => createUser('ATTENDEE'))
    );

    const responses = await Promise.all(
      attendees.map((attendee) =>
        register(event.id, attendee, { slotId: tiny.id })
      )
    );

    expect(responses.filter((r) => r.status === 201)).toHaveLength(2);
    expect(
      responses.filter((r) => r.body.error?.code === 'SLOT_FULL')
    ).toHaveLength(18);
    expect(await getSlotCounts(tiny.id)).toEqual({
      registeredCount: 2,
      activeRegistrations: 2
    });
    // Failed slot attempts must not leak event-level places.
    expect(await getEventCounts(event.id)).toEqual({
      registeredCount: 2,
      activeRegistrations: 2
    });
  });

  it('releases the slot place on cancellation', async () => {
    const organizer = await createUser('ORGANIZER');
    const first = await createUser('ATTENDEE');
    const second = await createUser('ATTENDEE');
    const event = await createSlottedEvent(organizer, [
      slotBody('Only', { capacity: 1 })
    ]);
    const slotId = event.slots[0]!.id;
    const registration = await register(event.id, first, { slotId }).expect(
      201
    );

    await request(app)
      .post(`/api/registrations/${registration.body.data.id}/cancel`)
      .set('Cookie', first.cookie)
      .expect(200);

    await register(event.id, second, { slotId }).expect(201);
    expect(await getSlotCounts(slotId)).toEqual({
      registeredCount: 1,
      activeRegistrations: 1
    });
  });

  it('lets the organizer change slots only until someone registers', async () => {
    const organizer = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const event = await createSlottedEvent(organizer, [slotBody('A')]);
    const patch = (body: Record<string, unknown>) =>
      request(app)
        .patch(`/api/events/${event.id}`)
        .set('Cookie', organizer.cookie)
        .send(body);

    const changed = await patch({
      slots: [slotBody('A2', { capacity: 4 }), slotBody('B', { hour: 16 })]
    }).expect(200);
    expect(changed.body.data.capacity).toBe(9);

    await register(event.id, attendee, {
      slotId: changed.body.data.slots[0].id
    }).expect(201);

    const locked = await patch({ slots: [slotBody('C')] }).expect(409);
    expect(locked.body.error.code).toBe('SLOTS_LOCKED');

    // Other fields stay editable.
    await patch({ title: 'Renamed' }).expect(200);

    const capacity = await patch({ capacity: 50 }).expect(400);
    expect(capacity.body.error.details.fields).toHaveProperty('capacity');
  });

  it('rejects slots that end before they start', async () => {
    const organizer = await createUser('ORGANIZER');
    const slot = slotBody('Backwards');

    const response = await createEvent(organizer, {
      startsAtLocal: undefined,
      capacity: undefined,
      slots: [{ ...slot, endsAtLocal: slot.startsAtLocal }]
    }).expect(400);

    expect(Object.keys(response.body.error.details.fields)).toContain(
      'slots.0.endsAtLocal'
    );
  });
});
