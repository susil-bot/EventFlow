import sharp from 'sharp';
import { AppError, ErrorCode } from '../../errors/app-error';
import type { ImageMimeType } from './image-type';

/** Longest side kept, in px: enough for a sharp cover on a 2× screen. */
export const MAX_IMAGE_SIDE = 2400;

/**
 * Images with more pixels than this are refused from their header, before
 * any decoding, so a tiny file that claims huge dimensions (a
 * "decompression bomb") can't exhaust the server's memory.
 */
export const MAX_INPUT_PIXELS = 40_000_000;

type SanitizedImage = { bytes: Buffer; width: number; height: number };

const unreadable = () =>
  new AppError(
    415,
    ErrorCode.UNSUPPORTED_IMAGE,
    "This image couldn't be read. Use a JPG, PNG or WebP image."
  );

/**
 * Re-encodes an uploaded image so only its pixels are kept:
 *
 * - Metadata is dropped: EXIF (including GPS location and camera serial
 *   numbers), XMP, ICC comments. The EXIF orientation is applied first, so
 *   phone photos aren't stored sideways.
 * - Anything else hidden in the file (a "polyglot" that is also HTML or a
 *   script, trailing data) is gone, because the result is a fresh encode.
 * - Huge dimensions are refused before decoding; large photos are scaled
 *   down to `MAX_IMAGE_SIDE`.
 *
 * The format stays the one detected from the file's bytes.
 */
export const sanitizeImage = async (
  bytes: Buffer,
  type: ImageMimeType
): Promise<SanitizedImage> => {
  const pipeline = sharp(bytes, {
    limitInputPixels: MAX_INPUT_PIXELS,
    failOn: 'error'
  })
    .rotate()
    .resize({
      width: MAX_IMAGE_SIDE,
      height: MAX_IMAGE_SIDE,
      fit: 'inside',
      withoutEnlargement: true
    });

  let encoded: sharp.Sharp;
  if (type === 'image/png') {
    encoded = pipeline.png({ compressionLevel: 9 });
  } else if (type === 'image/webp') {
    encoded = pipeline.webp({ quality: 85 });
  } else {
    encoded = pipeline.jpeg({ quality: 85, mozjpeg: true });
  }

  try {
    const { data, info } = await encoded.toBuffer({ resolveWithObject: true });
    return { bytes: data, width: info.width, height: info.height };
  } catch (error) {
    if (error instanceof Error && /pixel limit/i.test(error.message)) {
      throw new AppError(
        413,
        ErrorCode.FILE_TOO_LARGE,
        'Image resolution is too high. The maximum is 40 megapixels.'
      );
    }
    throw unreadable();
  }
};
