import type { Queryable } from '../../../db/pool';
import type { AttendeeRow } from '../types';

/** True when the attendee holds an ACTIVE registration for the event. */
export const attendeeHasPlace = async (
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

export const listActiveAttendees = async (
  db: Queryable,
  eventId: string
): Promise<AttendeeRow[]> => {
  const { rows } = await db.query<AttendeeRow>(
    `SELECT r.id AS registration_id, u.id AS attendee_id, u.name, u.email,
            r.created_at AS registered_at, s.label AS slot_label
       FROM registrations r
       JOIN users u ON u.id = r.attendee_id
       LEFT JOIN event_slots s ON s.id = r.slot_id
      WHERE r.event_id = $1 AND r.status = 'ACTIVE'
      ORDER BY r.created_at ASC`,
    [eventId]
  );
  return rows;
};
