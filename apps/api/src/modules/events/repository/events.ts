import { firstRow, type Queryable } from '../../../db/pool';
import type {
  EventCategory,
  EventRow,
  EventStatus,
  EventType,
  EventWriteFields,
  SocialLink
} from '../types';
import { EVENT_COLUMNS, FROM_EVENTS, liveCondition } from './columns';

/** Maps writable DTO fields to their column names. */
const WRITABLE_COLUMNS: Record<keyof EventWriteFields, string> = {
  title: 'title',
  description: 'description',
  startsAt: 'starts_at',
  timeZone: 'time_zone',
  venue: 'venue',
  capacity: 'capacity',
  eventType: 'event_type',
  category: 'category',
  slug: 'slug',
  onlineUrl: 'online_url',
  socialLinks: 'social_links',
  cityId: 'city_id',
  priceMinor: 'price_minor',
  publishAt: 'publish_at',
  expiresAt: 'expires_at',
  venueLatitude: 'venue_latitude',
  venueLongitude: 'venue_longitude'
};

/** jsonb columns need their value serialised and cast. */
const toColumnValue = (key: keyof EventWriteFields, value: unknown) =>
  key === 'socialLinks' ? JSON.stringify(value) : value;

const CASTS: Partial<Record<keyof EventWriteFields, string>> = {
  socialLinks: '::jsonb'
};

export const findEventById = async (
  db: Queryable,
  id: string
): Promise<EventRow | undefined> => {
  const { rows } = await db.query<EventRow>(
    `SELECT ${EVENT_COLUMNS} ${FROM_EVENTS} WHERE e.id = $1`,
    [id]
  );
  return rows[0];
};

export const findEventBySlug = async (
  db: Queryable,
  slug: string
): Promise<EventRow | undefined> => {
  const { rows } = await db.query<EventRow>(
    `SELECT ${EVENT_COLUMNS} ${FROM_EVENTS} WHERE e.slug = $1`,
    [slug]
  );
  return rows[0];
};

/** Returns which of the candidate slugs are already used. */
export const findTakenSlugs = async (
  db: Queryable,
  candidates: string[]
): Promise<Set<string>> => {
  const { rows } = await db.query<{ slug: string }>(
    'SELECT slug FROM events WHERE slug = ANY($1::text[])',
    [candidates]
  );
  return new Set(rows.map((row) => row.slug));
};

export const listByOrganizer = async (
  db: Queryable,
  organizerId: string
): Promise<EventRow[]> => {
  const { rows } = await db.query<EventRow>(
    `SELECT ${EVENT_COLUMNS} ${FROM_EVENTS}
      WHERE e.organizer_id = $1
      ORDER BY e.starts_at ASC`,
    [organizerId]
  );
  return rows;
};

export type NewEvent = {
  organizerId: string;
  title: string;
  description: string;
  startsAt: Date;
  timeZone: string;
  venue: string;
  capacity: number;
  status: EventStatus;
  eventType: EventType;
  category: EventCategory;
  slug: string;
  onlineUrl: string | null;
  socialLinks: SocialLink[];
  cityId: string | null;
  priceMinor: number;
  publishAt: Date | null;
  expiresAt: Date | null;
  venueLatitude: number | null;
  venueLongitude: number | null;
};

export const insertEvent = async (
  db: Queryable,
  input: NewEvent
): Promise<string> => {
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO events
       (organizer_id, title, description, starts_at, time_zone, venue,
        capacity, status, event_type, category, slug, online_url,
        social_links, city_id, price_minor, publish_at, expires_at,
        venue_latitude, venue_longitude, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb,
             $14, $15, $16, $17, $18, $19, $1)
     RETURNING id`,
    [
      input.organizerId,
      input.title,
      input.description,
      input.startsAt,
      input.timeZone,
      input.venue,
      input.capacity,
      input.status,
      input.eventType,
      input.category,
      input.slug,
      input.onlineUrl,
      JSON.stringify(input.socialLinks),
      input.cityId,
      input.priceMinor,
      input.publishAt,
      input.expiresAt,
      input.venueLatitude,
      input.venueLongitude
    ]
  );
  return firstRow(rows, 'event').id;
};

/**
 * Updates the given fields. When capacity changes, the row is only updated
 * if the new capacity still fits the active registrations; the check and
 * write happen in one statement so a concurrent registration cannot slip
 * in between. With `requireNoRegistrations` (used when time slots are
 * replaced) the update only applies while nobody is registered. Returns
 * `false` when a guard rejected the update.
 */
export const updateEventFields = async (
  db: Queryable,
  id: string,
  fields: EventWriteFields,
  {
    editorId,
    requireNoRegistrations = false
  }: { editorId: string; requireNoRegistrations?: boolean }
): Promise<boolean> => {
  const entries = Object.entries(fields).filter(
    ([, value]) => value !== undefined
  ) as [keyof EventWriteFields, unknown][];

  const assignments = entries.map(
    ([key], index) =>
      `${WRITABLE_COLUMNS[key]} = $${index + 2}${CASTS[key] ?? ''}`
  );
  const values: unknown[] = [
    id,
    ...entries.map(([key, value]) => toColumnValue(key, value)),
    editorId
  ];
  const editorParam = `$${values.length}`;

  let guard = '';
  if (fields.capacity !== undefined) {
    values.push(fields.capacity);
    guard = ` AND registered_count <= $${values.length}`;
  }
  if (requireNoRegistrations) {
    guard += ' AND registered_count = 0';
  }

  const result = await db.query(
    `UPDATE events
        SET ${[...assignments, `updated_by = ${editorParam}`, 'updated_at = now()'].join(', ')}
      WHERE id = $1 AND status <> 'CANCELED'${guard}`,
    values
  );
  return result.rowCount === 1;
};

/** Moves an event between statuses only if it is currently in `from`. */
export const transitionStatus = async (
  db: Queryable,
  id: string,
  from: EventStatus[],
  to: EventStatus,
  editorId: string
): Promise<boolean> => {
  const result = await db.query(
    `UPDATE events
        SET status = $2, updated_by = $4, updated_at = now()
      WHERE id = $1 AND status = ANY($3::event_status[])`,
    [id, to, from, editorId]
  );
  return result.rowCount === 1;
};

/**
 * Publishes a draft. A go-live time that has already passed is cleared, so
 * the event is live at once. Refused for events that have started, whose
 * listing has expired, or that happen at a venue without a map pin.
 */
export const publishDraft = async (
  db: Queryable,
  id: string,
  editorId: string
): Promise<boolean> => {
  const result = await db.query(
    `UPDATE events
        SET status = 'PUBLISHED',
            publish_at = CASE WHEN publish_at > now() THEN publish_at END,
            updated_by = $2,
            updated_at = now()
      WHERE id = $1 AND status = 'DRAFT' AND starts_at > now()
        AND (expires_at IS NULL OR expires_at > now())
        AND (event_type = 'ONLINE' OR venue_latitude IS NOT NULL)`,
    [id, editorId]
  );
  return result.rowCount === 1;
};

/**
 * Takes a published event back to draft, clearing its go-live time. Only
 * while nobody holds a place (the check is part of the same statement), so
 * attendees are never left with a hidden event; cancel it instead.
 */
export const unpublishEvent = async (
  db: Queryable,
  id: string,
  editorId: string
): Promise<boolean> => {
  const result = await db.query(
    `UPDATE events
        SET status = 'DRAFT', publish_at = NULL, updated_by = $2,
            updated_at = now()
      WHERE id = $1 AND status = 'PUBLISHED' AND registered_count = 0`,
    [id, editorId]
  );
  return result.rowCount === 1;
};

/**
 * Atomically takes one place. The `WHERE` clause is re-evaluated after the
 * row lock is acquired, so concurrent callers can never push
 * `registered_count` past `capacity`.
 */
export const tryReservePlace = async (
  db: Queryable,
  id: string
): Promise<boolean> => {
  const result = await db.query(
    `UPDATE events
        SET registered_count = registered_count + 1
      WHERE id = $1
        AND ${liveCondition('events')}
        AND registered_count < capacity`,
    [id]
  );
  return result.rowCount === 1;
};

export const releasePlace = async (db: Queryable, id: string) => {
  await db.query(
    `UPDATE events
        SET registered_count = registered_count - 1
      WHERE id = $1 AND registered_count > 0`,
    [id]
  );
};
