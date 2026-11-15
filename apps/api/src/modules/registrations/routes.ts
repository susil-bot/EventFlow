import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { eventIdParamsSchema } from '../events/schemas';
import * as controller from './controller';
import { registerBodySchema, registrationIdParamsSchema } from './schemas';

const attendeeOnly = [authenticate, authorize('ATTENDEE')];

export const registrationsRouter = Router();

registrationsRouter.post(
  '/events/:id/registrations',
  ...attendeeOnly,
  validate({ params: eventIdParamsSchema, body: registerBodySchema }),
  controller.register
);
registrationsRouter.post(
  '/registrations/:id/cancel',
  ...attendeeOnly,
  validate({ params: registrationIdParamsSchema }),
  controller.cancel
);
registrationsRouter.get(
  '/me/registrations',
  ...attendeeOnly,
  controller.listMine
);
