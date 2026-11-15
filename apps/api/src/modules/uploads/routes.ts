import express, { type RequestHandler, Router } from 'express';
import { config } from '../../config';
import { AppError, ErrorCode } from '../../errors/app-error';
import { authenticate, authorize } from '../../middleware/authenticate';
import * as controller from './controller';

const MAX_MB = Math.round((config.maxUploadBytes / 1024 / 1024) * 10) / 10;

/**
 * Content types the browser may send for an image. The declared type is
 * not trusted: the service still detects the real type from the bytes.
 * Rejecting other types early blocks form posts (`text/plain`,
 * `multipart/form-data`) from other sites.
 */
const ACCEPTED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/octet-stream'
]);

const requireImageContentType: RequestHandler = (req, _res, next) => {
  const type = req.headers['content-type']?.split(';')[0]?.trim().toLowerCase();
  if (!type || !ACCEPTED_CONTENT_TYPES.has(type)) {
    next(
      new AppError(
        415,
        ErrorCode.UNSUPPORTED_IMAGE,
        'Use a JPG, PNG or WebP image.'
      )
    );
    return;
  }
  next();
};

/** Reads the raw request body (the image file itself) up to the size cap. */
const readImageBody: RequestHandler = (req, res, next) => {
  express.raw({ type: () => true, limit: config.maxUploadBytes })(
    req,
    res,
    (error?: unknown) => {
      if (
        typeof error === 'object' &&
        error !== null &&
        (error as { type?: unknown }).type === 'entity.too.large'
      ) {
        next(
          new AppError(
            413,
            ErrorCode.FILE_TOO_LARGE,
            `Images must be ${MAX_MB} MB or smaller.`
          )
        );
        return;
      }
      next(error);
    }
  );
};

/** Organizer image uploads under `/api/uploads`. */
export const uploadsRouter = Router();

uploadsRouter.post(
  '/images',
  authenticate,
  authorize('ORGANIZER'),
  requireImageContentType,
  readImageBody,
  controller.uploadImage
);
