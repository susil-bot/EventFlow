import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, ErrorCode } from '../errors/app-error';
import { logger } from '../logger';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`No API endpoint matches ${req.method} ${req.path}.`));
};

/** Errors raised by Express's body parsers (bad JSON, too large, …). */
type BodyParserError = { type: string; status: number };

const isBodyParserError = (error: unknown): error is BodyParserError =>
  typeof error === 'object' &&
  error !== null &&
  typeof (error as { type?: unknown }).type === 'string' &&
  typeof (error as { status?: unknown }).status === 'number';

const BODY_PARSER_MESSAGES: Record<string, string> = {
  'entity.parse.failed': 'Request body is not valid JSON.',
  'entity.too.large': 'Request body is too large.',
  'encoding.unsupported': 'Request body encoding is not supported.',
  'charset.unsupported': 'Request body charset is not supported.'
};

/** Turns any thrown value into the client-safe `AppError` to send back. */
const toAppError = (error: unknown): AppError | undefined => {
  if (error instanceof AppError) {
    return error;
  }
  if (isBodyParserError(error) && error.status < 500) {
    return new AppError(
      error.status === 413 ? 413 : 400,
      ErrorCode.VALIDATION_FAILED,
      BODY_PARSER_MESSAGES[error.type] ?? 'The request could not be read.'
    );
  }
  return undefined;
};

/**
 * Errors that mean the database can't be reached (Postgres down, wrong
 * host or credentials, connection dropped). Node network codes and
 * PostgreSQL SQLSTATE classes 08 (connection), 57P (shutdown) and 53300
 * (too many connections), plus a missing database or bad password.
 */
const DB_UNAVAILABLE_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
  '08000',
  '08001',
  '08003',
  '08006',
  '57P01',
  '57P02',
  '57P03',
  '53300',
  '3D000',
  '28P01'
]);

export const isDatabaseUnavailable = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const { code, message, errors } = error as {
    code?: unknown;
    message?: unknown;
    errors?: unknown;
  };
  if (typeof code === 'string' && DB_UNAVAILABLE_CODES.has(code)) {
    return true;
  }
  if (
    typeof message === 'string' &&
    /Connection terminated|timeout exceeded when trying to connect/i.test(
      message
    )
  ) {
    return true;
  }
  // Node reports a refused IPv4 + IPv6 connect as an AggregateError.
  return Array.isArray(errors) && errors.some(isDatabaseUnavailable);
};

/**
 * The only place that writes error responses. Expected errors (`AppError`)
 * are returned as-is. Anything else is logged with the request id and
 * answered with a generic 500, so internals (SQL, stack traces) never leak;
 * the id in the body lets a developer find the matching log line.
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const known = toAppError(error);
  if (known) {
    if (known.status >= 500) {
      logger.error({ err: error, requestId: req.requestId }, known.message);
    }
    res.status(known.status).json({
      error: {
        code: known.code,
        message: known.message,
        ...(known.details === undefined ? {} : { details: known.details })
      }
    });
    return;
  }

  if (isDatabaseUnavailable(error)) {
    // An outage, not a bug: say so to the user (503, try again later) and
    // tell the developer where to look.
    logger.error(
      {
        err: error,
        requestId: req.requestId,
        method: req.method,
        path: req.path
      },
      'Database unreachable: is PostgreSQL running and DATABASE_URL correct? (GET /api/health checks it)'
    );
    res.status(503).json({
      error: {
        code: ErrorCode.SERVICE_UNAVAILABLE,
        message:
          'EventFlow is temporarily unavailable. Please try again in a moment.',
        ...(req.requestId ? { requestId: req.requestId } : {})
      }
    });
    return;
  }

  logger.error(
    {
      err: error,
      requestId: req.requestId,
      method: req.method,
      path: req.path
    },
    'Unhandled error'
  );
  res.status(500).json({
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Something went wrong. Please try again.',
      ...(req.requestId ? { requestId: req.requestId } : {})
    }
  });
};
