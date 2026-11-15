import { randomUUID } from 'node:crypto';
import { DateTime } from 'luxon';
import request from 'supertest';
import { createApp } from '../src/app';
import { pool } from '../src/db/pool';
import { hashPassword } from '../src/modules/auth/password';
import type { AccountStatus, Role } from '../src/modules/auth/types';
import type { EventStatus } from '../src/modules/events/types';

export const app = createApp();
export const PASSWORD = 'Password123!';

let cachedHash: string | undefined;

export const resetDatabase = async () => {
  await pool.query('TRUNCATE registrations, events, users CASCADE');
};

export type TestUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  cookie: string;
};

export const createUser = async (
  role: Role,
  name = `${role.toLowerCase()} ${randomUUID().slice(0, 6)}`,
  { status = 'ACTIVE' }: { status?: AccountStatus } = {}
): Promise<TestUser> => {
  cachedHash ??= await hashPassword(PASSWORD);
  const email = `${randomUUID()}@example.com`;
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO users (name, email, password_hash, role, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [name, email, cachedHash, role, status]
  );
  const cookie = await loginAs(email);
  return { id: rows[0]!.id, name, email, role, cookie };
};

export const loginAs = async (email: string): Promise<string> => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password: PASSWORD })
    .expect(200);
  const setCookie = response.headers['set-cookie'] as unknown as string[];
  return setCookie[0]!.split(';')[0]!;
};

/** Wall-clock input `days` from now, in the given zone. */
export const futureLocal = (days = 7, zone = 'UTC') =>
  DateTime.now().setZone(zone).plus({ days }).toFormat("yyyy-MM-dd'T'HH:mm");

/** Map pin used for test venues (Chennai). */
export const TEST_VENUE_PIN = { latitude: 13.0827, longitude: 80.2707 };

export const validEventBody = (overrides: Record<string, unknown> = {}) => ({
  title: 'Test Meetup',
  description: 'A meetup used in tests.',
  startsAtLocal: futureLocal(),
  timeZone: 'Asia/Kolkata',
  venue: 'Test Hall',
  capacity: 10,
  category: 'MEETUP',
  cityId: 'chennai',
  venueLocation: TEST_VENUE_PIN,
  ...overrides
});

type EventOverrides = {
  capacity?: number;
  status?: EventStatus;
  startsAt?: Date;
  title?: string;
  venue?: string;
  category?: string;
  eventType?: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  registeredCount?: number;
  /** Defaults to Chennai for in-person/hybrid events, none for online. */
  cityId?: string | null;
  /** Paise; free by default. */
  priceMinor?: number;
  /** Go-live time; null = live once published. */
  publishAt?: Date | null;
  /** Listing end; null = listed until it starts. */
  expiresAt?: Date | null;
  /** Defaults to a Chennai pin for in-person/hybrid events; null for none. */
  venueLocation?: { latitude: number; longitude: number } | null;
};

/** Inserts an event directly (bypasses validation, e.g. for past events). */
export const createEvent = async (
  organizer: TestUser,
  {
    capacity = 10,
    status = 'PUBLISHED',
    startsAt,
    title = 'Factory event',
    venue = 'Factory venue',
    category = 'OTHER',
    eventType = 'IN_PERSON',
    registeredCount = 0,
    cityId = eventType === 'ONLINE' ? null : 'chennai',
    priceMinor = 0,
    publishAt = null,
    expiresAt = null,
    venueLocation = eventType === 'ONLINE' ? null : TEST_VENUE_PIN
  }: EventOverrides = {}
): Promise<string> => {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO events
       (organizer_id, title, description, starts_at, time_zone, venue,
        capacity, status, category, event_type, registered_count,
        online_url, city_id, price_minor, publish_at, expires_at,
        venue_latitude, venue_longitude)
     VALUES ($1, $2, 'Factory description', $3, 'UTC', $4, $5, $6, $7, $8,
             $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING id`,
    [
      organizer.id,
      title,
      startsAt ?? DateTime.now().plus({ days: 7 }).toJSDate(),
      venue,
      capacity,
      status,
      category,
      eventType,
      registeredCount,
      eventType === 'IN_PERSON' ? null : 'https://meet.example.com/factory',
      cityId,
      priceMinor,
      publishAt,
      expiresAt,
      venueLocation?.latitude ?? null,
      venueLocation?.longitude ?? null
    ]
  );
  return rows[0]!.id;
};

export const getEventCounts = async (eventId: string) => {
  const { rows } = await pool.query<{
    registered_count: number;
    active: string;
  }>(
    `SELECT e.registered_count,
            (SELECT count(*) FROM registrations r
              WHERE r.event_id = e.id AND r.status = 'ACTIVE') AS active
       FROM events e WHERE e.id = $1`,
    [eventId]
  );
  return {
    registeredCount: rows[0]!.registered_count,
    activeRegistrations: Number(rows[0]!.active)
  };
};

export const register = (
  eventId: string,
  attendee: TestUser,
  body: { slotId?: string } = {}
) =>
  request(app)
    .post(`/api/events/${eventId}/registrations`)
    .set('Cookie', attendee.cookie)
    .send(body);

/** Wall-clock slot input starting `days` from now, `hours` long. */
export const slotBody = (
  label: string,
  { days = 7, hour = 10, hours = 1, capacity = 5, zone = 'UTC' } = {}
) => {
  const start = DateTime.now()
    .setZone(zone)
    .plus({ days })
    .set({ hour, minute: 0, second: 0, millisecond: 0 });
  return {
    label,
    startsAtLocal: start.toFormat("yyyy-MM-dd'T'HH:mm"),
    endsAtLocal: start.plus({ hours }).toFormat("yyyy-MM-dd'T'HH:mm"),
    capacity
  };
};

/** Creates a published event with time slots through the API. */
export const createSlottedEvent = async (
  organizer: TestUser,
  slots: ReturnType<typeof slotBody>[]
) => {
  const response = await request(app)
    .post('/api/events')
    .set('Cookie', organizer.cookie)
    .send(
      validEventBody({
        timeZone: 'UTC',
        startsAtLocal: undefined,
        capacity: undefined,
        slots,
        publish: true
      })
    )
    .expect(201);
  return response.body.data as {
    id: string;
    capacity: number;
    slots: { id: string; label: string; capacity: number }[];
  };
};

export const getSlotCounts = async (slotId: string) => {
  const { rows } = await pool.query<{
    registered_count: number;
    active: string;
  }>(
    `SELECT s.registered_count,
            (SELECT count(*) FROM registrations r
              WHERE r.slot_id = s.id AND r.status = 'ACTIVE') AS active
       FROM event_slots s WHERE s.id = $1`,
    [slotId]
  );
  return {
    registeredCount: rows[0]!.registered_count,
    activeRegistrations: Number(rows[0]!.active)
  };
};
