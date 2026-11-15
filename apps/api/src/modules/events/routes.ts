import { Router } from 'express';
import {
  authenticate,
  authorize,
  optionalAuthenticate
} from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import * as controller from './controller';
import {
  createEventSchema,
  discoverEventsQuerySchema,
  eventFacetsQuerySchema,
  eventIdParamsSchema,
  eventRefParamsSchema,
  updateEventSchema
} from './schemas';

const byId = { params: eventIdParamsSchema };

/** Public discovery + organizer management under `/api/events`. */
export const eventsRouter = Router();

eventsRouter.get(
  '/',
  optionalAuthenticate,
  validate({ query: discoverEventsQuerySchema }),
  controller.listPublic
);
// Before `/:id`, which would otherwise match "facets" as a slug.
eventsRouter.get(
  '/facets',
  validate({ query: eventFacetsQuerySchema }),
  controller.facets
);
// Accepts the event id or its URL slug.
eventsRouter.get(
  '/:id',
  optionalAuthenticate,
  validate({ params: eventRefParamsSchema }),
  controller.getOne
);
eventsRouter.post(
  '/',
  authenticate,
  authorize('ORGANIZER'),
  validate({ body: createEventSchema }),
  controller.create
);
// The organizer or any admin (audited) can edit and (un)publish.
eventsRouter.patch(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validate({ ...byId, body: updateEventSchema }),
  controller.update
);
eventsRouter.post(
  '/:id/publish',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validate(byId),
  controller.publish
);
eventsRouter.post(
  '/:id/unpublish',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validate(byId),
  controller.unpublish
);
eventsRouter.post(
  '/:id/cancel',
  authenticate,
  authorize('ORGANIZER'),
  validate(byId),
  controller.cancel
);

/** Organizer dashboard under `/api/organizer`. */
export const organizerRouter = Router();

organizerRouter.use(authenticate, authorize('ORGANIZER'));
organizerRouter.get('/events', controller.listMine);
organizerRouter.get(
  '/events/:id/attendees',
  validate(byId),
  controller.listAttendees
);
