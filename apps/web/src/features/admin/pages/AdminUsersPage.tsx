import React, { useState } from 'react';
import { useSearchParams } from 'react-router';
import { getErrorMessage } from '@/shared/api/client';
import {
  ACCOUNT_STATUSES,
  type AccountStatus,
  type Role
} from '@/shared/api/types';
import { Button } from '@/shared/ui/button';
import { SelectField } from '@/shared/ui/select-field';
import { TextField } from '@/shared/ui/text-field';
import {
  ACCOUNT_STATUS_LABEL,
  AdminUserTable,
  ROLE_LABEL
} from '../components/admin-user-table';
import { PageHeader } from '@/shared/ui/page-header';
import { Pager } from '@/shared/ui/pager';
import { StateView } from '@/shared/ui/state-view';
import {
  type UserAction,
  useAdminUsers,
  useUserAction
} from '../hooks/use-admin';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { Filters } from './styles';

const PAGE_SIZE = 25;

const SUCCESS: Record<UserAction['type'], string> = {
  approve: 'Organizer approved. They can now create events.',
  suspend: 'Account suspended. The user has been signed out.',
  reactivate: 'Account reactivated.',
  changeRole: 'Role updated.'
};

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  ...(['ORGANIZER', 'ATTENDEE', 'ADMIN'] as Role[]).map((role) => ({
    value: role,
    label: ROLE_LABEL[role]
  }))
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...ACCOUNT_STATUSES.map((status) => ({
    value: status,
    label: ACCOUNT_STATUS_LABEL[status]
  }))
];

export const AdminUsersPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  // Filters live in the URL so a filtered view can be shared or reloaded.
  const [params, setParams] = useSearchParams();
  const role = (params.get('role') || undefined) as Role | undefined;
  const status = (params.get('status') || undefined) as
    | AccountStatus
    | undefined;
  const search = params.get('search') ?? '';
  const offset = Number(params.get('offset') ?? 0) || 0;
  const [searchDraft, setSearchDraft] = useState(search);

  const users = useAdminUsers({
    role,
    status,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset
  });
  const action = useUserAction();
  const [pendingUserId, setPendingUserId] = useState<string>();

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'offset') {
      next.delete('offset');
    }
    setParams(next);
  };

  const handleAction = (userAction: UserAction) => {
    setPendingUserId(userAction.userId);
    action.mutate(userAction, {
      onSuccess: () => toast.success(SUCCESS[userAction.type]),
      onError: (error) => toast.error(getErrorMessage(error)),
      onSettled: () => setPendingUserId(undefined)
    });
  };

  const total = users.data?.total ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Approve new organizers, change roles and suspend accounts. Every action is recorded in the audit log."
      />
      <Filters
        onSubmit={(event) => {
          event.preventDefault();
          setFilter('search', searchDraft.trim());
        }}
        aria-label="Filter users"
      >
        <TextField
          label="Search"
          type="search"
          placeholder="Name or email"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <SelectField
          label="Role"
          options={ROLE_OPTIONS}
          value={role ?? ''}
          onChange={(event) => setFilter('role', event.target.value)}
        />
        <SelectField
          label="Status"
          options={STATUS_OPTIONS}
          value={status ?? ''}
          onChange={(event) => setFilter('status', event.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </Filters>
      <StateView
        isLoading={users.isLoading}
        loadingLabel="Loading users"
        error={users.error}
        onRetry={() => void users.refetch()}
        isEmpty={users.data?.items.length === 0}
        emptyIcon="users"
        emptyTitle="No users match these filters"
      >
        <AdminUserTable
          users={users.data?.items ?? []}
          currentUserId={user?.id ?? ''}
          onAction={handleAction}
          pendingUserId={pendingUserId}
        />
        <Pager
          total={total}
          offset={offset}
          pageSize={PAGE_SIZE}
          label="users"
          onOffsetChange={(next) => setFilter('offset', String(next))}
        />
      </StateView>
    </>
  );
};
