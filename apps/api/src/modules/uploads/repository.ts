import { firstRow, type Queryable } from '../../db/pool';
import type { ImageMimeType } from './image-type';

export const insertUpload = async (
  db: Queryable,
  input: {
    ownerId: string;
    fileName: string;
    mimeType: ImageMimeType;
    sizeBytes: number;
  }
): Promise<string> => {
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO uploads (owner_id, file_name, mime_type, size_bytes)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [input.ownerId, input.fileName, input.mimeType, input.sizeBytes]
  );
  return firstRow(rows, 'upload').id;
};

/** Returns how many of `ids` exist and belong to `ownerId`. */
export const countOwnedUploads = async (
  db: Queryable,
  ids: string[],
  ownerId: string
): Promise<number> => {
  const { rows } = await db.query<{ count: number }>(
    `SELECT count(*)::int AS count
       FROM uploads
      WHERE id = ANY($1::uuid[]) AND owner_id = $2`,
    [ids, ownerId]
  );
  return firstRow(rows).count;
};
