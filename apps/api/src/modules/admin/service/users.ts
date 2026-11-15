import { pool, withTransaction } from '../../../db/pool';
import { AppError, ErrorCode } from '../../../errors/app-error';
import type {
  AccountStatus,
  AuthUser,
  Role,
  SignupRole
} from '../../auth/types';
import {
  findAdminUser,
  findUserForUpdate,
  insertAuditEntry,
  listUsers,
  updateUserAccess
} from '../repository';
import type { ListUsersQuery } from '../schemas';
import type { AdminAction, AdminUserDto, AdminUserRow, Page } from '../types';
import { toAdminUserDto } from './mappers';

const userNotFound = () =>
  AppError.notFound('User not found.', ErrorCode.USER_NOT_FOUND);

const invalidTransition = (message: string) =>
  AppError.conflict(ErrorCode.INVALID_USER_TRANSITION, message);

export const listUsersForAdmin = async (
  query: ListUsersQuery
): Promise<Page<AdminUserDto>> => {
  const { rows, total } = await listUsers(pool, query);
  return {
    items: rows.map(toAdminUserDto),
    total,
    limit: query.limit,
    offset: query.offset
  };
};

type Change = {
  action: AdminAction;
  /** Validates the locked row and returns its new role and status. */
  plan: (user: AdminUserRow) => Promise<{ role: Role; status: AccountStatus }>;
  reason?: string;
};

/**
 * Shared shape of every user change: lock the row, refuse to act on
 * yourself or on other admins, apply the change and write the audit entry,
 * all in one transaction.
 */
const changeUser = async (
  admin: AuthUser,
  userId: string,
  { action, plan, reason }: Change
): Promise<AdminUserDto> => {
  await withTransaction(async (client) => {
    const user = await findUserForUpdate(client, userId);
    if (!user) {
      throw userNotFound();
    }
    if (user.id === admin.id) {
      throw invalidTransition("You can't change your own account.");
    }
    if (user.role === 'ADMIN') {
      throw invalidTransition(
        'Admin accounts can only be managed with the admin CLI.'
      );
    }
    const next = await plan(user);
    await updateUserAccess(client, user.id, next);
    await insertAuditEntry(client, {
      adminId: admin.id,
      action,
      targetType: 'USER',
      targetId: user.id,
      reason,
      metadata: {
        from: { role: user.role, status: user.status },
        to: next
      }
    });
  });
  const updated = await findAdminUser(pool, userId);
  if (!updated) {
    throw userNotFound();
  }
  return toAdminUserDto(updated);
};

export const approveOrganizer = (admin: AuthUser, userId: string) =>
  changeUser(admin, userId, {
    action: 'APPROVE_ORGANIZER',
    plan: async (user) => {
      if (user.role !== 'ORGANIZER' || user.status !== 'PENDING_APPROVAL') {
        throw invalidTransition(
          'Only organizers waiting for approval can be approved.'
        );
      }
      return { role: user.role, status: 'ACTIVE' };
    }
  });

/** Takes effect at once: the user's next request is rejected. */
export const suspendUser = (admin: AuthUser, userId: string, reason: string) =>
  changeUser(admin, userId, {
    action: 'SUSPEND_USER',
    reason,
    plan: async (user) => {
      if (user.status === 'SUSPENDED') {
        throw invalidTransition('This account is already suspended.');
      }
      return { role: user.role, status: 'SUSPENDED' };
    }
  });

export const reactivateUser = (admin: AuthUser, userId: string) =>
  changeUser(admin, userId, {
    action: 'REACTIVATE_USER',
    plan: async (user) => {
      if (user.status !== 'SUSPENDED') {
        throw invalidTransition('Only suspended accounts can be reactivated.');
      }
      return { role: user.role, status: 'ACTIVE' };
    }
  });

/** Role changes must not strand events or registrations. */
const assertRoleChangeSafe = (user: AdminUserRow, role: SignupRole) => {
  if (user.role === 'ORGANIZER' && user.upcoming_event_count > 0) {
    throw AppError.conflict(
      ErrorCode.USER_HAS_ACTIVE_EVENTS,
      `This organizer has ${user.upcoming_event_count} upcoming event(s). Cancel them first.`
    );
  }
  if (user.role === 'ATTENDEE' && user.active_registration_count > 0) {
    throw AppError.conflict(
      ErrorCode.USER_HAS_ACTIVE_REGISTRATIONS,
      `This attendee has ${user.active_registration_count} active registration(s). They must cancel them first.`
    );
  }
  if (user.role === role) {
    throw invalidTransition(`This user is already an ${role.toLowerCase()}.`);
  }
};

export const changeUserRole = (
  admin: AuthUser,
  userId: string,
  role: SignupRole
) =>
  changeUser(admin, userId, {
    action: 'CHANGE_ROLE',
    plan: async (user) => {
      assertRoleChangeSafe(user, role);
      // An admin granting the organizer role is also approving it; a
      // suspended account stays suspended.
      return {
        role,
        status: user.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'
      };
    }
  });
