import { randomUUID } from 'node:crypto';
import { pool } from '../../db/pool';
import { AppError, ErrorCode } from '../../errors/app-error';
import type { AuthUser } from '../auth/types';
import { detectImageType, IMAGE_TYPES } from './image-type';
import { insertUpload } from './repository';
import { sanitizeImage } from './sanitize';
import { imageStore } from './storage';

export type UploadDto = { id: string; url: string };

/**
 * Saves an organizer's image:
 *
 * 1. The type comes from the file's bytes, never from the client's header
 *    or file name (the route already capped the size).
 * 2. The image is re-encoded (`sanitizeImage`): metadata such as GPS
 *    location is dropped and huge dimensions are refused.
 * 3. It is stored under a new random key (`imageStore`: local disk here,
 *    S3 in production) and recorded with its owner, so only that organizer
 *    can attach it to an event.
 */
export const saveImage = async (
  user: AuthUser,
  bytes: Buffer | undefined
): Promise<UploadDto> => {
  if (!bytes || bytes.length === 0) {
    throw AppError.badRequest('Choose an image to upload.');
  }
  const mimeType = detectImageType(bytes);
  if (!mimeType) {
    throw new AppError(
      415,
      ErrorCode.UNSUPPORTED_IMAGE,
      'Use a JPG, PNG or WebP image.'
    );
  }

  const clean = await sanitizeImage(bytes, mimeType);
  const key = `${randomUUID()}.${IMAGE_TYPES[mimeType]}`;
  await imageStore.put(key, clean.bytes, mimeType);

  try {
    const id = await insertUpload(pool, {
      ownerId: user.id,
      fileName: key,
      mimeType,
      sizeBytes: clean.bytes.length
    });
    return { id, url: imageStore.publicUrl(key) };
  } catch (error) {
    // Don't leave an orphaned file behind if the row couldn't be written.
    await imageStore.remove(key).catch(() => undefined);
    throw error;
  }
};
