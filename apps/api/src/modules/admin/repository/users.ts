import type { Queryable } from '../../../db/pool';
import { containsPattern } from '../../../db/sql';
import type { AccountStatus, Role } from '../../auth/types';
import type { AdminUserRow } from '../types';

const USER_COLUMNS = `
  u.id, u.name, u.email, u.role, u.status, u.status_changed_at, u.created_at,
  (SELECT count(*)::int FROM events e
    WHERE e.organizer_id = u.id AND e.status <> 'CANCELED'
      AND e.starts_at > now()) AS upcoming_event_count,
  (SELECT count(*)::int FROM registrations r
     JOIN events e ON e.id = r.event_id
    WHERE r.attendee_id = u.id AND r.status = 'ACTIVE'
      AND e.starts_at > now()) AS active_registration_count
`;

export type UserFilters = {
  role?: Role;
  status?: AccountStatus;
  search?: string;
  limit: number;
  offset: number;
};

export const listUsers = async (
  db: Queryable,
  { role, status, search, limit, offset }: UserFilters
): Promise<{ rows: AdminUserRow[]; total: number }> => {
  const where = `
    WHERE ($1::user_role IS NULL OR u.role = $1)
      AND ($2::account_status IS NULL OR u.status = $2)
      AND ($3::text IS NULL OR u.name ILIKE $3 OR u.email ILIKE $3)`;
  const filters = [
    role ?? null,
    status ?? null,
    search ? containsPattern(search) : null
  ];

  const [{ rows }, count] = await Promise.all([
    db.query<AdminUserRow>(
      `SELECT ${USER_COLUMNS} FROM users u ${where}
        ORDER BY (u.status = 'PENDING_APPROVAL') DESC, u.created_at DESC
        LIMIT $4 OFFSET $5`,
      [...filters, limit, offset]
    ),
    db.query<{ total: number }>(
      `SELECT count(*)::int AS total FROM users u ${where}`,
      filters
    )
  ]);
  return { rows, total: count.rows[0]?.total ?? 0 };
};

/** Loads and row-locks a user for the rest of the transaction. */
export const findUserForUpdate = async (
  db: Queryable,
  id: string
): Promise<AdminUserRow | undefined> => {
  await db.query('SELECT 1 FROM users WHERE id = $1 FOR UPDATE', [id]);
  const { rows } = await db.query<AdminUserRow>(
    `SELECT ${USER_COLUMNS} FROM users u WHERE u.id = $1`,
    [id]
  );
  return rows[0];
};

export const findAdminUser = async (
  db: Queryable,
  id: string
): Promise<AdminUserRow | undefined> => {
  const { rows } = await db.query<AdminUserRow>(
    `SELECT ${USER_COLUMNS} FROM users u WHERE u.id = $1`,
    [id]
  );
  return rows[0];
};

export const updateUserAccess = async (
  db: Queryable,
  id: string,
  { role, status }: { role: Role; status: AccountStatus }
): Promise<void> => {
  await db.query(
    `UPDATE users
        SET role = $2, status = $3,
            status_changed_at = CASE WHEN status <> $3 THEN now()
                                     ELSE status_changed_at END
      WHERE id = $1`,
    [id, role, status]
  );
};
