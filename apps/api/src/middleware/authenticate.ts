import type { Request, RequestHandler, Response } from 'express';
import { config } from '../config';
import { pool } from '../db/pool';
import { AppError, ErrorCode } from '../errors/app-error';
import { findSessionUser } from '../modules/auth/repository';
import { verifySessionToken } from '../modules/auth/session-token';
import type { AuthUser, Role } from '../modules/auth/types';

/** Cookie options shared by sign-in (set) and sign-out / revocation (clear). */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.cookieSecure,
  path: '/'
} as const;

const clearSession = (res: Response) =>
  res.clearCookie(config.sessionCookieName, sessionCookieOptions);

type SessionLookup =
  | { kind: 'anonymous' }
  | { kind: 'revoked' }
  | { kind: 'user'; user: AuthUser };

/**
 * Resolves the session cookie to the user's *current* record. A valid token
 * for a deleted or suspended account counts as revoked.
 */
const lookupSession = async (req: Request): Promise<SessionLookup> => {
  const cookies = req.cookies as Record<string, string> | undefined;
  const token = cookies?.[config.sessionCookieName];
  if (!token) {
    return { kind: 'anonymous' };
  }
  const userId = verifySessionToken(token);
  if (!userId) {
    return { kind: 'revoked' };
  }
  const user = await findSessionUser(pool, userId);
  if (!user || user.status === 'SUSPENDED') {
    return { kind: 'revoked' };
  }
  return { kind: 'user', user };
};

/** Requires a valid session for an existing, non-suspended user. */
export const authenticate: RequestHandler = async (req, res, next) => {
  const session = await lookupSession(req);
  if (session.kind !== 'user') {
    if (session.kind === 'revoked') {
      clearSession(res);
    }
    next(
      AppError.unauthenticated(
        session.kind === 'revoked'
          ? 'Your session has ended. Please sign in again.'
          : undefined
      )
    );
    return;
  }
  req.user = session.user;
  next();
};

/** Attaches `req.user` when a valid session exists; never rejects. */
export const optionalAuthenticate: RequestHandler = async (req, res, next) => {
  const session = await lookupSession(req);
  if (session.kind === 'user') {
    req.user = session.user;
  } else if (session.kind === 'revoked') {
    clearSession(res);
  }
  next();
};

const describeRoles = (roles: Role[]) =>
  roles.map((role) => `${role.toLowerCase()}s`).join(' or ');

/**
 * Allows only the given roles, and only for ACTIVE accounts (an organizer
 * awaiting approval is signed in but can't use organizer features).
 * Requires `authenticate` to have run first.
 */
export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(AppError.unauthenticated());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(
        AppError.forbidden(
          `This action is only available to ${describeRoles(roles)}.`
        )
      );
      return;
    }
    if (req.user.status === 'PENDING_APPROVAL') {
      next(
        AppError.forbidden(
          'Your organizer account is waiting for approval by an admin.',
          ErrorCode.ACCOUNT_PENDING_APPROVAL
        )
      );
      return;
    }
    next();
  };

/** Narrowing helper for controllers behind `authenticate`. */
export const requireUser = (req: Request): AuthUser => {
  if (!req.user) {
    throw AppError.unauthenticated();
  }
  return req.user;
};
