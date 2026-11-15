import { firstRow, type Queryable } from '../../db/pool';
import type { AccountStatus, AuthUser, Role, UserRow } from './types';

export const findUserByEmail = async (
  db: Queryable,
  email: string
): Promise<UserRow | undefined> => {
  const { rows } = await db.query<UserRow>(
    'SELECT * FROM users WHERE lower(email) = lower($1)',
    [email]
  );
  return rows[0];
};

/** The session view of a user (no password hash). Primary-key lookup. */
export const findSessionUser = async (
  db: Queryable,
  id: string
): Promise<AuthUser | undefined> => {
  const { rows } = await db.query<AuthUser>(
    `SELECT id, name, email, role, status, home_city_id AS "homeCityId"
       FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
};

export const insertUser = async (
  db: Queryable,
  input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    status: AccountStatus;
  }
): Promise<UserRow> => {
  const { rows } = await db.query<UserRow>(
    `INSERT INTO users (name, email, password_hash, role, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.name, input.email, input.passwordHash, input.role, input.status]
  );
  return firstRow(rows, 'user');
};

/** Sets or clears the user's home city. Returns false for an unknown user. */
export const updateHomeCity = async (
  db: Queryable,
  userId: string,
  cityId: string | null
): Promise<boolean> => {
  const result = await db.query(
    'UPDATE users SET home_city_id = $2 WHERE id = $1',
    [userId, cityId]
  );
  return result.rowCount === 1;
};
