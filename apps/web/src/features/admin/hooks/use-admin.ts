import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { adminApi } from '@/shared/api/endpoints';
import type {
  AdminUserFilters,
  EventStatus,
  SignupRole
} from '@/shared/api/types';
import { queryKeys } from '@/shared/api/query-keys';

export const useAdminStats = () =>
  useQuery({ queryKey: queryKeys.adminStats, queryFn: adminApi.stats });

export const useAdminUsers = (filters: AdminUserFilters) =>
  useQuery({
    queryKey: queryKeys.adminUsers(filters),
    queryFn: () => adminApi.listUsers(filters),
    // Keep the table on screen while a new filter loads.
    placeholderData: keepPreviousData
  });

export const useAdminEvents = (status?: EventStatus) =>
  useQuery({
    queryKey: queryKeys.adminEvents(status),
    queryFn: () => adminApi.listEvents(status)
  });

export const useAuditLog = () =>
  useQuery({
    queryKey: queryKeys.adminAudit,
    queryFn: () => adminApi.auditLog()
  });

/** Every admin action can change stats, lists and the audit log. */
const useRefreshAdmin = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin });
    void queryClient.invalidateQueries({ queryKey: ['events'] });
  };
};

export type UserAction =
  | { type: 'approve'; userId: string }
  | { type: 'suspend'; userId: string; reason: string }
  | { type: 'reactivate'; userId: string }
  | { type: 'changeRole'; userId: string; role: SignupRole };

const runUserAction = (action: UserAction) => {
  switch (action.type) {
    case 'approve':
      return adminApi.approve(action.userId);
    case 'suspend':
      return adminApi.suspend(action.userId, action.reason);
    case 'reactivate':
      return adminApi.reactivate(action.userId);
    case 'changeRole':
      return adminApi.changeRole(action.userId, action.role);
  }
};

export const useUserAction = () => {
  const refresh = useRefreshAdmin();
  return useMutation({ mutationFn: runUserAction, onSuccess: refresh });
};

export const useAdminCancelEvent = () => {
  const refresh = useRefreshAdmin();
  return useMutation({
    mutationFn: ({ eventId, reason }: { eventId: string; reason: string }) =>
      adminApi.cancelEvent(eventId, reason),
    onSuccess: refresh
  });
};
