import type { AuthUser } from '../modules/auth/types';

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` / `optionalAuthenticate`. */
      user?: AuthUser;
      /** Set by the `requestId` middleware for every request. */
      requestId?: string;
    }
  }
}

export {};
