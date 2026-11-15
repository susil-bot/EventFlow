export const ROLES = ['ORGANIZER', 'ATTENDEE', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

/** Roles anyone can pick at sign-up. Admins are created with a CLI script. */
export const SIGNUP_ROLES = ['ORGANIZER', 'ATTENDEE'] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

/**
 * - `ACTIVE`: full access for the role.
 * - `PENDING_APPROVAL`: an organizer waiting for an admin; can sign in but
 *   not use organizer features.
 * - `SUSPENDED`: cannot sign in; existing sessions stop working at once.
 */
export const ACCOUNT_STATUSES = [
  'ACTIVE',
  'PENDING_APPROVAL',
  'SUSPENDED'
] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

/**
 * The signed-in user attached to `req.user`, loaded fresh from the database
 * on every request. Never contains secrets.
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  /** Saved city for Discover; null until the user picks one. */
  homeCityId: string | null;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  status: AccountStatus;
  status_changed_at: Date | null;
  home_city_id: string | null;
  created_at: Date;
};
