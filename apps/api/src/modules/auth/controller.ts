import type { Request, Response } from 'express';
import { config } from '../../config';
import {
  requireUser,
  sessionCookieOptions
} from '../../middleware/authenticate';
import type { HomeCityInput, LoginInput, SignupInput } from './schemas';
import * as authService from './service';
import { signSessionToken } from './session-token';
import type { AuthUser } from './types';

const startSession = (res: Response, user: AuthUser) => {
  res.cookie(config.sessionCookieName, signSessionToken(user.id), {
    ...sessionCookieOptions,
    maxAge: config.sessionTtlHours * 60 * 60 * 1000
  });
};

export const login = async (req: Request, res: Response) => {
  const user = await authService.login(req.body as LoginInput);
  startSession(res, user);
  res.json({ data: user });
};

export const signup = async (req: Request, res: Response) => {
  const user = await authService.signup(req.body as SignupInput);
  startSession(res, user);
  res.status(201).json({ data: user });
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(config.sessionCookieName, sessionCookieOptions);
  res.status(204).end();
};

/** Current session or `null`; lets the client check without a 401. */
export const session = (req: Request, res: Response) => {
  res.json({ data: req.user ?? null });
};

export const me = (req: Request, res: Response) => {
  res.json({ data: requireUser(req) });
};

export const updateHomeCity = async (req: Request, res: Response) => {
  const { cityId } = req.body as HomeCityInput;
  res.json({ data: await authService.setHomeCity(requireUser(req), cityId) });
};
