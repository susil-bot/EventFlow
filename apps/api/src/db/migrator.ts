import fs from 'node:fs/promises';
import path from 'node:path';
import type { Pool } from 'pg';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Minimal forward-only migrator. Each `.sql` file runs once, in name order,
 * inside its own transaction, and is recorded in `schema_migrations`.
 */
export const runMigrations = async (db: Pool): Promise<string[]> => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = (await fs.readdir(MIGRATIONS_DIR))
    .filter((file) => file.endsWith('.sql'))
    .sort();
  const { rows } = await db.query<{ name: string }>(
    'SELECT name FROM schema_migrations'
  );
  const applied = new Set(rows.map((row) => row.name));
  const pending = files.filter((file) => !applied.has(file));

  for (const file of pending) {
    const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [
        file
      ]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  return pending;
};

export const dropSchema = async (db: Pool): Promise<void> => {
  await db.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
};
