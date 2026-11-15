import { z } from 'zod';
import { SIGNUP_ROLES } from './types';

const email = z
  .string({ error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.')
  .max(254);

export const passwordSchema = z
  .string({ error: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(200, 'Password must be 200 characters or fewer.');

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: 'Password is required.' })
    .min(1, 'Password is required.')
    .max(200)
});

export const signupSchema = z.object({
  name: z
    .string({ error: 'Name is required.' })
    .trim()
    .min(1, 'Name is required.')
    .max(100),
  email,
  password: passwordSchema,
  // ADMIN is deliberately not accepted here (see `scripts/create-admin.ts`).
  role: z.enum(SIGNUP_ROLES, { message: 'Choose organizer or attendee.' })
});

/** `null` clears the saved city. */
export const homeCitySchema = z.object({
  cityId: z
    .string({ error: 'Choose a city.' })
    .trim()
    .toLowerCase()
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Choose a city from the list.')
    .nullable()
});

export type HomeCityInput = z.infer<typeof homeCitySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
