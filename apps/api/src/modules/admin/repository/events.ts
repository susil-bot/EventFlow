import type { Queryable } from '../../../db/pool';
import { EVENT_COLUMNS, FROM_EVENTS } from '../../events/repository';
import type { EventRow, EventStatus } from '../../events/types';

/** Every event, drafts included, newest start first. */
export const listAllEvents = async (
  db: Queryable,
  status: EventStatus | undefined
): Promise<EventRow[]> => {
  const { rows } = await db.query<EventRow>(
    `SELECT ${EVENT_COLUMNS} ${FROM_EVENTS}
      WHERE ($1::event_status IS NULL OR e.status = $1)
      ORDER BY e.starts_at DESC`,
    [status ?? null]
  );
  return rows;
};

/** Cancels any non-canceled event and stores the reason shown to people. */
export const cancelEventWithReason = async (
  db: Queryable,
  eventId: string,
  reason: string,
  adminId: string
): Promise<boolean> => {
  const result = await db.query(
    `UPDATE events
        SET status = 'CANCELED', cancellation_reason = $2, updated_by = $3,
            updated_at = now()
      WHERE id = $1 AND status <> 'CANCELED'`,
    [eventId, reason, adminId]
  );
  return result.rowCount === 1;
};
