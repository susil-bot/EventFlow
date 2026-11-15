import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors/app-error';

type Schemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export type FieldErrors = Record<string, string>;

const toFieldErrors = (
  issues: { path: PropertyKey[]; message: string }[]
): FieldErrors =>
  issues.reduce<FieldErrors>((acc, issue) => {
    const key = issue.path.map(String).join('.') || '_root';
    return key in acc ? acc : { ...acc, [key]: issue.message };
  }, {});

/**
 * Parses request parts with zod. Parsed values replace the raw ones so
 * handlers only ever see validated, typed data. Validated query values are
 * exposed on `res.locals.query` because Express 5 makes `req.query` a getter.
 */
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, res, next) => {
    const sources = ['params', 'query', 'body'] as const;

    for (const source of sources) {
      const schema = schemas[source];
      if (schema) {
        const result = schema.safeParse(req[source] ?? {});
        if (!result.success) {
          next(
            AppError.badRequest('Please correct the highlighted fields.', {
              fields: toFieldErrors(result.error.issues)
            })
          );
          return;
        }
        if (source === 'query') {
          res.locals.query = result.data;
        } else {
          req[source] = result.data;
        }
      }
    }
    next();
  };
