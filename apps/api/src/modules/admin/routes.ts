import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { eventIdParamsSchema } from '../events/schemas';
import * as controller from './controller';
import {
  auditQuerySchema,
  changeRoleBodySchema,
  listEventsQuerySchema,
  listUsersQuerySchema,
  reasonBodySchema,
  userIdParamsSchema
} from './schemas';

const byUserId = { params: userIdParamsSchema };

/** Admin area under `/api/admin`. Every route requires an active admin. */
export const adminRouter = Router();

adminRouter.use(authenticate, authorize('ADMIN'));

adminRouter.get('/stats', controller.stats);
adminRouter.get(
  '/users',
  validate({ query: listUsersQuerySchema }),
  controller.listUsers
);
adminRouter.post('/users/:id/approve', validate(byUserId), controller.approve);
adminRouter.post(
  '/users/:id/suspend',
  validate({ ...byUserId, body: reasonBodySchema }),
  controller.suspend
);
adminRouter.post(
  '/users/:id/reactivate',
  validate(byUserId),
  controller.reactivate
);
adminRouter.patch(
  '/users/:id/role',
  validate({ ...byUserId, body: changeRoleBodySchema }),
  controller.changeRole
);
adminRouter.get(
  '/events',
  validate({ query: listEventsQuerySchema }),
  controller.listEvents
);
adminRouter.post(
  '/events/:id/cancel',
  validate({ params: eventIdParamsSchema, body: reasonBodySchema }),
  controller.cancelEvent
);
adminRouter.get(
  '/audit-log',
  validate({ query: auditQuerySchema }),
  controller.auditLog
);
