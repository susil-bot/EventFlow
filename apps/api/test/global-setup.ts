import { Pool } from 'pg';

/** Recreates the test schema once per `jest` run. */
export default async function globalSetup() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET ??= 'test-only-secret-that-is-at-least-32-chars';
  const { dropSchema, runMigrations } = await import('../src/db/migrator');
  const pool = new Pool({
    connectionString:
      process.env.TEST_DATABASE_URL ??
      'postgres://postgres:postgres@localhost:5432/events_test'
  });
  try {
    await dropSchema(pool);
    await runMigrations(pool);
  } finally {
    await pool.end();
  }
}
