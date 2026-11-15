import { localDiskStore } from './local-disk';
import type { ImageStore } from './types';

export type { ImageStore } from './types';

/**
 * The store the app uses. Local disk for this project; in production this is
 * where an S3 store would be chosen (for example when `S3_BUCKET` is set),
 * with no change to the upload service:
 *
 * - `put` → `PutObject` with the detected `ContentType`,
 *   `Cache-Control: public, max-age=31536000, immutable` (keys never change)
 *   and `X-Content-Type-Options: nosniff`.
 * - `remove` → `DeleteObject`.
 * - `publicUrl` → `${CDN_URL}/${key}`: a private bucket behind CloudFront
 *   (origin access control), so images are only readable through the CDN.
 * - Credentials come from the server's IAM role, never from keys in `.env`.
 *
 * Images are sanitised before `put` (see `sanitize.ts`), so whatever reaches
 * the bucket is already a clean re-encode.
 */
export const imageStore: ImageStore = localDiskStore;
