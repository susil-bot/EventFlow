import { firstRow, type Queryable } from '../../db/pool';
import { EVENT_COLUMNS } from '../events/repository';
import type { RegistrationRow, RegistrationWithEventRow } from './types';

export const insertRegistration = async (
  db: Queryable,
  eventId: string,
  attendeeId: string,
  slotId: string | null = null
): Promise<string> => {
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO registrations (event_id, attendee_id, slot_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [eventId, attendeeId, slotId]
  );
  return firstRow(rows, 'registration').id;
};

/** True when the attendee already holds an ACTIVE registration for the event. */
export const hasActiveRegistration = async (
  db: Queryable,
  eventId: string,
  attendeeId: string
): Promise<boolean> => {
  const { rowCount } = await db.query(
    `SELECT 1 FROM registrations
      WHERE event_id = $1 AND attendee_id = $2 AND status = 'ACTIVE'`,
    [eventId, attendeeId]
  );
  return rowCount === 1;
};

/** Locks the registration row for the rest of the transaction. */
export const findRegistrationForUpdate = async (
  db: Queryable,
  id: string
): Promise<RegistrationRow | undefined> => {
  const { rows } = await db.query<RegistrationRow>(
    'SELECT * FROM registrations WHERE id = $1 FOR UPDATE',
    [id]
  );
  return rows[0];
};

export const markCanceled = async (
  db: Queryable,
  id: string
): Promise<boolean> => {
  const result = await db.query(
    `UPDATE registrations
        SET status = 'CANCELED', canceled_at = now()
      WHERE id = $1 AND status = 'ACTIVE'`,
    [id]
  );
  return result.rowCount === 1;
};

const REGISTRATION_WITH_EVENT = `
  SELECT r.id AS registration_id, r.status AS registration_status,
         r.slot_id AS registration_slot_id,
         r.created_at AS registered_at, r.canceled_at,
         ${EVENT_COLUMNS}
    FROM registrations r
    JOIN events e ON e.id = r.event_id
    JOIN users u ON u.id = e.organizer_id
`;

export const findRegistrationWithEvent = async (
  db: Queryable,
  id: string
): Promise<RegistrationWithEventRow | undefined> => {
  const { rows } = await db.query<RegistrationWithEventRow>(
    `${REGISTRATION_WITH_EVENT} WHERE r.id = $1`,
    [id]
  );
  return rows[0];
};

/**
 * Upcoming registrations for an attendee. For each event only the most
 * recent registration is returned so re-registering after a cancellation
 * does not show the event twice.
 */
export const listUpcomingForAttendee = async (
  db: Queryable,
  attendeeId: string
): Promise<RegistrationWithEventRow[]> => {
  const { rows } = await db.query<RegistrationWithEventRow>(
    `SELECT DISTINCT ON (sub.id) sub.*
       FROM (${REGISTRATION_WITH_EVENT}
              WHERE r.attendee_id = $1 AND e.starts_at > now()) sub
      ORDER BY sub.id, sub.registered_at DESC`,
    [attendeeId]
  );
  return rows.sort((a, b) => a.starts_at.getTime() - b.starts_at.getTime());
};
