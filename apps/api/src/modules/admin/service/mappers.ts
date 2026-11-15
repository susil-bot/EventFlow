import type {
  AdminUserDto,
  AdminUserRow,
  AuditEntryDto,
  AuditRow
} from '../types';

export const toAdminUserDto = (row: AdminUserRow): AdminUserDto => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  status: row.status,
  statusChangedAt: row.status_changed_at?.toISOString() ?? null,
  createdAt: row.created_at.toISOString(),
  upcomingEventCount: row.upcoming_event_count,
  activeRegistrationCount: row.active_registration_count
});

export const toAuditEntryDto = (row: AuditRow): AuditEntryDto => ({
  id: row.id,
  adminId: row.admin_id,
  adminName: row.admin_name,
  action: row.action,
  targetType: row.target_type,
  targetId: row.target_id,
  reason: row.reason,
  metadata: row.metadata,
  createdAt: row.created_at.toISOString()
});
