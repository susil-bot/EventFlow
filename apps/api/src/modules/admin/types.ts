import type { AccountStatus, Role } from '../auth/types';

export const ADMIN_ACTIONS = [
  'APPROVE_ORGANIZER',
  'SUSPEND_USER',
  'REACTIVATE_USER',
  'CHANGE_ROLE',
  'CANCEL_EVENT',
  'EDIT_EVENT',
  'PUBLISH_EVENT',
  'UNPUBLISH_EVENT'
] as const;
export type AdminAction = (typeof ADMIN_ACTIONS)[number];

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  status_changed_at: Date | null;
  created_at: Date;
  /** Upcoming events the user organises that are not canceled. */
  upcoming_event_count: number;
  /** ACTIVE registrations for upcoming events. */
  active_registration_count: number;
};

/** What admins see about a user. Never includes the password hash. */
export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  statusChangedAt: string | null;
  createdAt: string;
  upcomingEventCount: number;
  activeRegistrationCount: number;
};

export type AuditRow = {
  id: string;
  admin_id: string;
  admin_name: string;
  action: AdminAction;
  target_type: 'USER' | 'EVENT';
  target_id: string;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
};

export type AuditEntryDto = {
  id: string;
  adminId: string;
  adminName: string;
  action: AdminAction;
  targetType: 'USER' | 'EVENT';
  targetId: string;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type PlatformStats = {
  users: Record<Role, number>;
  pendingOrganizers: number;
  suspendedUsers: number;
  events: { DRAFT: number; PUBLISHED: number; CANCELED: number };
  upcomingPublishedEvents: number;
  activeRegistrations: number;
};

export type { Page } from '../../types/pagination';
