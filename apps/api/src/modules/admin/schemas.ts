import { z } from 'zod';
import { ACCOUNT_STATUSES, ROLES, SIGNUP_ROLES } from '../auth/types';
import { EVENT_STATUSES } from '../events/types';

export const userIdParamsSchema = z.object({
  id: z.uuid('Invalid user id.')
});

export const listUsersQuerySchema = z.object({
  role: z.enum(ROLES, { error: 'Unknown role.' }).optional(),
  status: z.enum(ACCOUNT_STATUSES, { error: 'Unknown status.' }).optional(),
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0)
});

export const listEventsQuerySchema = z.object({
  status: z.enum(EVENT_STATUSES, { error: 'Unknown status.' }).optional()
});

export const auditQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50)
});

/** Every moderation action needs a reason; it is shown in the audit log. */
const reason = z
  .string({ error: 'A reason is required.' })
  .trim()
  .min(3, 'Reason must be at least 3 characters.')
  .max(500, 'Reason must be 500 characters or fewer.');

export const reasonBodySchema = z.object({ reason });

/** Admins can move users between the two public roles only. */
export const changeRoleBodySchema = z.object({
  role: z.enum(SIGNUP_ROLES, { error: 'Choose organizer or attendee.' })
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type AuditQuery = z.infer<typeof auditQuerySchema>;
export type ReasonBody = z.infer<typeof reasonBodySchema>;
export type ChangeRoleBody = z.infer<typeof changeRoleBodySchema>;
