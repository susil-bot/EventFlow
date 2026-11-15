import { z } from 'zod';

export const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

export const httpsUrl = (requiredMessage: string) =>
  z
    .string({ error: requiredMessage })
    .trim()
    .max(500, 'Link must be 500 characters or fewer.')
    .refine(isHttpsUrl, 'Enter a valid https:// link.');
