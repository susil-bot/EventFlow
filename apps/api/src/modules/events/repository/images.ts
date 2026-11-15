import type { Queryable } from '../../../db/pool';

/** Replaces the ordered promo images; the first upload is the cover. */
export const replaceImages = async (
  db: Queryable,
  eventId: string,
  uploadIds: string[]
) => {
  await db.query('DELETE FROM event_images WHERE event_id = $1', [eventId]);
  if (uploadIds.length === 0) {
    return;
  }
  await db.query(
    `INSERT INTO event_images (event_id, upload_id, position)
     SELECT $1, upload_id, position - 1
       FROM unnest($2::uuid[]) WITH ORDINALITY AS i(upload_id, position)`,
    [eventId, uploadIds]
  );
};
