import { firstRow, type Queryable } from '../../../db/pool';

export type SlotWrite = {
  label: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
};

/**
 * Replaces an event's slots. Callers must first win the
 * `requireNoRegistrations` guard on the event row (same transaction), so no
 * registration can point at a slot being removed.
 */
export const replaceSlots = async (
  db: Queryable,
  eventId: string,
  slots: SlotWrite[]
) => {
  await db.query('DELETE FROM event_slots WHERE event_id = $1', [eventId]);
  if (slots.length === 0) {
    return;
  }
  await db.query(
    `INSERT INTO event_slots (event_id, label, starts_at, ends_at, capacity)
     SELECT $1, label, starts_at, ends_at, capacity
       FROM unnest($2::text[], $3::timestamptz[], $4::timestamptz[],
                   $5::int[]) AS s(label, starts_at, ends_at, capacity)`,
    [
      eventId,
      slots.map((slot) => slot.label),
      slots.map((slot) => slot.startsAt),
      slots.map((slot) => slot.endsAt),
      slots.map((slot) => slot.capacity)
    ]
  );
};

/**
 * Atomically takes one place in a slot, with the same conditional-UPDATE
 * guard as `tryReservePlace`. Call it after `tryReservePlace` so locks are
 * always taken event row first, then slot row.
 */
export const tryReserveSlot = async (
  db: Queryable,
  eventId: string,
  slotId: string
): Promise<boolean> => {
  const result = await db.query(
    `UPDATE event_slots
        SET registered_count = registered_count + 1
      WHERE id = $1
        AND event_id = $2
        AND starts_at > now()
        AND registered_count < capacity`,
    [slotId, eventId]
  );
  return result.rowCount === 1;
};

export const releaseSlot = async (db: Queryable, slotId: string) => {
  await db.query(
    `UPDATE event_slots
        SET registered_count = registered_count - 1
      WHERE id = $1 AND registered_count > 0`,
    [slotId]
  );
};

export type SlotRow = {
  id: string;
  event_id: string;
  starts_at: Date;
  capacity: number;
  registered_count: number;
};

export const findSlot = async (
  db: Queryable,
  slotId: string
): Promise<SlotRow | undefined> => {
  const { rows } = await db.query<SlotRow>(
    `SELECT id, event_id, starts_at, capacity, registered_count
       FROM event_slots WHERE id = $1`,
    [slotId]
  );
  return rows[0];
};

export const countSlots = async (
  db: Queryable,
  eventId: string
): Promise<number> => {
  const { rows } = await db.query<{ count: number }>(
    'SELECT count(*)::int AS count FROM event_slots WHERE event_id = $1',
    [eventId]
  );
  return firstRow(rows).count;
};
