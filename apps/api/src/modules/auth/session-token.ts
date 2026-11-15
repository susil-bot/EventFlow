import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../../config';

/**
 * The token only identifies the user. Role and status are read from the
 * database on every request, so changes (approval, suspension, role change)
 * take effect immediately instead of when the token expires.
 */
const payloadSchema = z.object({ sub: z.uuid() });

export const signSessionToken = (userId: string): string =>
  jwt.sign({}, config.jwtSecret, {
    subject: userId,
    expiresIn: `${config.sessionTtlHours}h`,
    algorithm: 'HS256'
  });

/** Returns the user id in a valid, unexpired token, or `null`. */
export const verifySessionToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256']
    });
    const parsed = payloadSchema.safeParse(decoded);
    return parsed.success ? parsed.data.sub : null;
  } catch {
    return null;
  }
};
