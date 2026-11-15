import React from 'react';
import type { AccountStatus, AdminUser, Role } from '@/shared/api/types';
import type { UserAction } from '../../hooks/use-admin';
import { Badge, type BadgeTone } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  StyledTable,
  TableWrapper
} from '@/features/organizer/components/attendee-table/styles';
import { ReasonAction } from '../reason-action';
import { Actions, Muted, NameCell } from './styles';

export type AdminUserTableProps = {
  users: AdminUser[];
  /** The signed-in admin; their own row has no actions. */
  currentUserId: string;
  onAction: (action: UserAction) => void;
  /** Row with a request in flight. */
  pendingUserId?: string;
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin',
  ORGANIZER: 'Organizer',
  ATTENDEE: 'Attendee'
};

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: 'Active',
  PENDING_APPROVAL: 'Awaiting approval',
  SUSPENDED: 'Suspended'
};

const STATUS_TONE: Record<AccountStatus, BadgeTone> = {
  ACTIVE: 'success',
  PENDING_APPROVAL: 'warning',
  SUSPENDED: 'danger'
};

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

const activity = (user: AdminUser) => {
  if (user.role === 'ORGANIZER') {
    return `${user.upcomingEventCount} upcoming event(s)`;
  }
  if (user.role === 'ATTENDEE') {
    return `${user.activeRegistrationCount} active registration(s)`;
  }
  return '—';
};

type RowActionsProps = {
  user: AdminUser;
  isPending: boolean;
  onAction: AdminUserTableProps['onAction'];
};

/** Which actions make sense depends on the user's role and status. */
const RowActions = ({ user, isPending, onAction }: RowActionsProps) => {
  const userId = user.id;
  if (user.status === 'SUSPENDED') {
    return (
      <Button
        size="sm"
        variant="secondary"
        isLoading={isPending}
        onClick={() => onAction({ type: 'reactivate', userId })}
      >
        Reactivate
      </Button>
    );
  }
  const otherRole = user.role === 'ORGANIZER' ? 'ATTENDEE' : 'ORGANIZER';
  return (
    <Actions>
      {user.status === 'PENDING_APPROVAL' ? (
        <Button
          size="sm"
          variant="success"
          isLoading={isPending}
          onClick={() => onAction({ type: 'approve', userId })}
          aria-label={`Approve ${user.name}`}
        >
          Approve
        </Button>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            onAction({ type: 'changeRole', userId, role: otherRole })
          }
        >
          Make {ROLE_LABEL[otherRole].toLowerCase()}
        </Button>
      )}
      <ReasonAction
        label="Suspend"
        ariaLabel={`Suspend ${user.name}`}
        confirmLabel="Suspend account"
        hint="They are signed out at once. Recorded in the audit log."
        isLoading={isPending}
        onConfirm={(reason) => onAction({ type: 'suspend', userId, reason })}
      />
    </Actions>
  );
};

/** User directory for admins, with approve / suspend / role actions. */
export const AdminUserTable = ({
  users,
  currentUserId,
  onAction,
  pendingUserId
}: AdminUserTableProps) => (
  <TableWrapper>
    <StyledTable>
      <caption>Users</caption>
      <thead>
        <tr>
          <th scope="col">User</th>
          <th scope="col">Role</th>
          <th scope="col">Status</th>
          <th scope="col">Activity</th>
          <th scope="col">Joined</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          const canManage = user.role !== 'ADMIN' && user.id !== currentUserId;
          return (
            <tr key={user.id}>
              <td>
                <NameCell>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </NameCell>
              </td>
              <td>{ROLE_LABEL[user.role]}</td>
              <td>
                <Badge tone={STATUS_TONE[user.status]}>
                  {ACCOUNT_STATUS_LABEL[user.status]}
                </Badge>
              </td>
              <td>{activity(user)}</td>
              <td>
                <time dateTime={user.createdAt}>
                  {dateFormat.format(new Date(user.createdAt))}
                </time>
              </td>
              <td>
                {canManage ? (
                  <RowActions
                    user={user}
                    isPending={pendingUserId === user.id}
                    onAction={onAction}
                  />
                ) : (
                  <Muted>Managed via CLI</Muted>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </StyledTable>
  </TableWrapper>
);
