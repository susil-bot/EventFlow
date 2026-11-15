import { Router } from 'express';
import { config } from '../../config';
import {
  authenticate,
  optionalAuthenticate
} from '../../middleware/authenticate';
import { rateLimit } from '../../middleware/rate-limit';
import { validate } from '../../middleware/validate';
import * as controller from './controller';
import { homeCitySchema, loginSchema, signupSchema } from './schemas';

/** Slows down password guessing and mass account creation. */
const authAttemptLimit = rateLimit(config.authRateLimit);

export const authRouter = Router();

authRouter.post(
  '/login',
  authAttemptLimit,
  validate({ body: loginSchema }),
  controller.login
);
authRouter.post(
  '/signup',
  authAttemptLimit,
  validate({ body: signupSchema }),
  controller.signup
);
authRouter.post('/logout', controller.logout);
authRouter.get('/me', authenticate, controller.me);
authRouter.patch(
  '/me/home-city',
  authenticate,
  validate({ body: homeCitySchema }),
  controller.updateHomeCity
);
authRouter.get('/session', optionalAuthenticate, controller.session);
