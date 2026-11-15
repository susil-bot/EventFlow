import { config } from '@/shared/config';
import type { FieldErrors } from './types';

/** Shape of every error the API sends (see the API's error handler). */
type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
    requestId?: string;
    details?: { fields?: FieldErrors };
  };
};

type Envelope<T> = ErrorBody & { data?: T };

/** An error answer from the API, or a network failure (`status` 0). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldErrors;
  /** Server-side reference for 5xx errors; quote it when reporting a bug. */
  readonly requestId?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors: FieldErrors = {},
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.requestId = requestId;
  }
}

const NETWORK_ERROR_MESSAGE =
  'Cannot reach the server. Check your connection and try again.';

/** What kind of failure it was, so a page can choose how to show it. */
export type ErrorKind =
  | 'fields'
  | 'auth'
  | 'rate-limit'
  | 'unavailable'
  | 'server'
  | 'network'
  | 'other';

export type ErrorDescription = {
  kind: ErrorKind;
  /** Plain-language message for the user. */
  message: string;
  /** Short request id for server errors, to quote when reporting them. */
  reference?: string;
};

/**
 * Turns any failure into what the user should see:
 * - field errors: the one problem itself, or how many fields to fix (the
 *   form highlights them);
 * - 503: the service is temporarily down (e.g. the database);
 * - other 5xx: our fault, with a short reference (the request id that
 *   finds the full request in the API logs);
 * - network: the server can't be reached at all;
 * - anything else (401, 403, 409, 429…): the API's own message.
 */
export const describeError = (error: unknown): ErrorDescription => {
  if (!(error instanceof Error)) {
    return {
      kind: 'other',
      message: 'Something went wrong. Please try again.'
    };
  }
  if (!(error instanceof ApiError)) {
    return { kind: 'other', message: error.message };
  }
  const reference = error.requestId?.slice(0, 8);
  const fieldMessages = Object.values(error.fieldErrors);
  if (fieldMessages.length > 0) {
    return {
      kind: 'fields',
      message:
        fieldMessages.length === 1
          ? (fieldMessages[0] ?? error.message)
          : `Please correct the ${fieldMessages.length} highlighted fields.`
    };
  }
  if (error.status === 0) {
    return { kind: 'network', message: error.message };
  }
  if (error.status === 503) {
    return { kind: 'unavailable', message: error.message, reference };
  }
  if (error.status >= 500) {
    return {
      kind: 'server',
      message: 'Something went wrong on our side. Please try again.',
      reference
    };
  }
  if (error.status === 429) {
    return { kind: 'rate-limit', message: error.message };
  }
  if (error.status === 401 || error.status === 403) {
    return { kind: 'auth', message: error.message };
  }
  return { kind: 'other', message: error.message };
};

/** One-line version of `describeError`, e.g. for toasts. */
export const getErrorMessage = (error: unknown): string => {
  const { message, reference } = describeError(error);
  return reference ? `${message} (reference: ${reference})` : message;
};

export const getFieldErrors = (error: unknown): FieldErrors =>
  error instanceof ApiError ? error.fieldErrors : {};

/** `fetch` that reports network failures as an `ApiError`. */
const send = async (path: string, init: RequestInit): Promise<Response> => {
  try {
    return await fetch(`${config.apiBaseUrl}${path}`, {
      credentials: 'include',
      ...init
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_ERROR_MESSAGE);
  }
};

/** Unwraps `{ data }`, or throws the `{ error }` body as an `ApiError`. */
const parse = async <T>(
  response: Response,
  fallbackMessage: string
): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }
  const payload = (await response.json().catch(() => ({}))) as Envelope<T>;
  if (!response.ok) {
    const { error } = payload;
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? fallbackMessage,
      error?.details?.fields,
      error?.requestId ?? response.headers.get('X-Request-Id') ?? undefined
    );
  }
  return payload.data as T;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

/** JSON request: sends cookies, unwraps `{ data }`, throws `ApiError`. */
export const apiRequest = async <T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {}
): Promise<T> => {
  const hasBody = body !== undefined;
  const response = await send(path, {
    method,
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined
  });
  return parse<T>(response, 'Something went wrong. Please try again.');
};

/** Sends a file as the raw request body (the API detects its real type). */
export const apiUpload = async <T>(path: string, file: File): Promise<T> => {
  const response = await send(path, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file
  });
  return parse<T>(
    response,
    'The image could not be uploaded. Please try again.'
  );
};
