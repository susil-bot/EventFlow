import type { Request, RequestHandler } from 'express';
import { AppError, ErrorCode } from '../errors/app-error';

export type RateLimitOptions = {
  /** Requests allowed per key within one window. */
  max: number;
  windowMs: number;
  /** Groups requests; defaults to the client IP. */
  keyOf?: (req: Request) => string;
  message?: string;
  /** Upper bound on tracked keys so memory stays bounded under attack. */
  maxKeys?: number;
};

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window rate limiter kept in process memory. Good for a single API
 * instance; behind several instances use a shared store (e.g. Redis) so
 * limits apply across all of them. Responds `429 RATE_LIMITED` with a
 * `Retry-After` header.
 */
export const rateLimit = ({
  max,
  windowMs,
  keyOf = (req) => req.ip ?? 'unknown',
  message = 'Too many attempts. Please try again in a few minutes.',
  maxKeys = 10_000
}: RateLimitOptions): RequestHandler => {
  const buckets = new Map<string, Bucket>();

  const prune = (now: number) => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  };

  return (req, res, next) => {
    const now = Date.now();
    if (buckets.size >= maxKeys) {
      prune(now);
    }
    const key = keyOf(req);
    const current = buckets.get(key);
    const bucket =
      current && current.resetAt > now
        ? current
        : { count: 0, resetAt: now + windowMs };
    bucket.count += 1;
    buckets.set(key, bucket);

    const remaining = Math.max(max - bucket.count, 0);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));

    if (bucket.count > max) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      next(
        new AppError(429, ErrorCode.RATE_LIMITED, message, {
          retryAfterSeconds
        })
      );
      return;
    }
    next();
  };
};
