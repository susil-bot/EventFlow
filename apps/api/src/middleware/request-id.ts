import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

const REQUEST_ID_HEADER = 'X-Request-Id';

/** Accept a caller's id (e.g. from a proxy) only if it is short and plain. */
const SAFE_REQUEST_ID = /^[\w-]{1,64}$/;

/**
 * Gives every request an id, echoes it in the `X-Request-Id` response
 * header and attaches it to logs and 5xx error bodies, so a user-reported
 * error can be matched to its log line.
 */
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.get(REQUEST_ID_HEADER);
  req.requestId =
    incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, req.requestId);
  next();
};
