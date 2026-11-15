import type { Queryable } from '../../../db/pool';
import type { AdminAction, AuditRow } from '../types';

export type AuditInput = {
  adminId: string;
  action: AdminAction;
  targetType: 'USER' | 'EVENT';
  targetId: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
};

/** Call inside the same transaction as the change being recorded. */
export const insertAuditEntry = async (db: Queryable, entry: AuditInput) => {
  await db.query(
    `INSERT INTO admin_audit_log
       (admin_id, action, target_type, target_id, reason, metadata)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      entry.adminId,
      entry.action,
      entry.targetType,
      entry.targetId,
      entry.reason ?? null,
      JSON.stringify(entry.metadata ?? {})
    ]
  );
};

export const listAuditEntries = async (
  db: Queryable,
  limit: number
): Promise<AuditRow[]> => {
  const { rows } = await db.query<AuditRow>(
    `SELECT a.*, u.name AS admin_name
       FROM admin_audit_log a
       JOIN users u ON u.id = a.admin_id
      ORDER BY a.created_at DESC
      LIMIT $1`,
    [limit]
  );
  return rows;
};
