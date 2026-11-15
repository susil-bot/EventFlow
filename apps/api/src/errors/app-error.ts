export const ErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_PENDING_APPROVAL: 'ACCOUNT_PENDING_APPROVAL',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  EVENT_NOT_OPEN: 'EVENT_NOT_OPEN',
  EVENT_CANCELED: 'EVENT_CANCELED',
  EVENT_STARTED: 'EVENT_STARTED',
  EVENT_FULL: 'EVENT_FULL',
  EVENT_NOT_EDITABLE: 'EVENT_NOT_EDITABLE',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  EVENT_HAS_REGISTRATIONS: 'EVENT_HAS_REGISTRATIONS',
  CAPACITY_BELOW_REGISTRATIONS: 'CAPACITY_BELOW_REGISTRATIONS',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  REGISTRATION_NOT_FOUND: 'REGISTRATION_NOT_FOUND',
  REGISTRATION_NOT_ACTIVE: 'REGISTRATION_NOT_ACTIVE',
  SLUG_TAKEN: 'SLUG_TAKEN',
  SLOT_REQUIRED: 'SLOT_REQUIRED',
  SLOT_NOT_FOUND: 'SLOT_NOT_FOUND',
  SLOT_FULL: 'SLOT_FULL',
  SLOT_STARTED: 'SLOT_STARTED',
  SLOTS_LOCKED: 'SLOTS_LOCKED',
  IMAGE_NOT_FOUND: 'IMAGE_NOT_FOUND',
  UNSUPPORTED_IMAGE: 'UNSUPPORTED_IMAGE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_USER_TRANSITION: 'INVALID_USER_TRANSITION',
  USER_HAS_ACTIVE_EVENTS: 'USER_HAS_ACTIVE_EVENTS',
  USER_HAS_ACTIVE_REGISTRATIONS: 'USER_HAS_ACTIVE_REGISTRATIONS',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, ErrorCode.VALIDATION_FAILED, message, details);
  }

  static unauthenticated(message = 'Please sign in to continue.') {
    return new AppError(401, ErrorCode.UNAUTHENTICATED, message);
  }

  static forbidden(
    message = 'You do not have permission to perform this action.',
    code: ErrorCode = ErrorCode.FORBIDDEN
  ) {
    return new AppError(403, code, message);
  }

  static notFound(message: string, code: ErrorCode = ErrorCode.NOT_FOUND) {
    return new AppError(404, code, message);
  }

  static conflict(code: ErrorCode, message: string, details?: unknown) {
    return new AppError(409, code, message, details);
  }
}
