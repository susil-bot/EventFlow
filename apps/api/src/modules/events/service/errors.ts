import {
  isPgError,
  PG_CHECK_VIOLATION,
  PG_FOREIGN_KEY_VIOLATION,
  PG_UNIQUE_VIOLATION
} from '../../../db/pool';
import { AppError, ErrorCode } from '../../../errors/app-error';

/** Error factories shared by the event use cases. */
export const eventNotFound = () =>
  AppError.notFound('Event not found.', ErrorCode.EVENT_NOT_FOUND);

export const fieldErrors = (fields: Record<string, string>) =>
  AppError.badRequest('Please correct the highlighted fields.', { fields });

const slugTaken = () =>
  AppError.conflict(
    ErrorCode.SLUG_TAKEN,
    'This event URL is already used by another event.',
    { fields: { slug: 'This URL is already used by another event.' } }
  );

export const CITY_REQUIRED = 'Choose the city where the event happens.';
export const PUBLISH_BEFORE_START =
  'The go-live time must be before the event starts.';
export const EXPIRY_NOT_AFTER_START =
  'The listing must end no later than the event start.';
export const EXPIRY_AFTER_PUBLISH =
  'The listing must end after the go-live time.';

const CHECK_FIELD_ERRORS: Record<string, Record<string, string>> = {
  events_city_required: { cityId: CITY_REQUIRED },
  events_publish_before_start: { publishAtLocal: PUBLISH_BEFORE_START },
  events_expiry_not_after_start: { expiresAtLocal: EXPIRY_NOT_AFTER_START },
  events_expiry_after_publish: { expiresAtLocal: EXPIRY_AFTER_PUBLISH }
};
const UNKNOWN_CITY = 'Choose a city from the list.';

/**
 * Maps database constraints on an event write to friendly field errors. The
 * database is the last line of defence (races, scripts); the service checks
 * the same rules first.
 */
export const rethrowEventWriteError = (error: unknown): never => {
  if (
    isPgError(error, PG_UNIQUE_VIOLATION) &&
    error.constraint === 'events_slug_unique'
  ) {
    throw slugTaken();
  }
  if (
    isPgError(error, PG_FOREIGN_KEY_VIOLATION) &&
    error.constraint === 'events_city_id_fkey'
  ) {
    throw fieldErrors({ cityId: UNKNOWN_CITY });
  }
  const checkFields =
    isPgError(error, PG_CHECK_VIOLATION) && error.constraint
      ? CHECK_FIELD_ERRORS[error.constraint]
      : undefined;
  if (checkFields) {
    throw fieldErrors(checkFields);
  }
  throw error;
};

export const invalidStart = () =>
  AppError.badRequest('Start date and time is invalid.');
