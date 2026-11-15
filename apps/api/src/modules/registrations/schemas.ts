import { z } from 'zod';

export const registrationIdParamsSchema = z.object({
  id: z.string().uuid('Invalid registration id.')
});

/** Body of POST /events/:id/registrations. */
export const registerBodySchema = z.object({
  slotId: z.uuid('Choose a valid time slot.').optional()
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
