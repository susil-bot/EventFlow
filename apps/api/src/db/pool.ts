import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { config } from '../config';
import { logger } from '../logger';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  // Fail fast instead of hanging requests when the database is down.
  connectionTimeoutMillis: 5_000
});

// An idle client can lose its connection (database restart, network blip).
// Without a listener that error would crash the process; the pool already
// discards the broken client, so logging is enough.
pool.on('error', (error) => {
  logger.error({ err: error }, 'Idle PostgreSQL client error');
});

/**
 * Anything that can run a query: the shared pool or a transaction client.
 * Repository functions accept this so they work inside and outside
 * transactions.
 */
export type Queryable = {
  query: <R extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[]
  ) => Promise<{ rows: R[]; rowCount: number | null }>;
};

export const withTransaction = async <T>(
  work: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    // A failed ROLLBACK (e.g. lost connection) must not hide the real error.
    await client.query('ROLLBACK').catch((rollbackError: unknown) => {
      logger.error({ err: rollbackError }, 'ROLLBACK failed');
    });
    throw error;
  } finally {
    client.release();
  }
};

/** Returns the first row or throws; for queries that must return a row. */
export const firstRow = <R>(rows: R[], what = 'row'): R => {
  const [row] = rows;
  if (row === undefined) {
    throw new Error(`Expected a ${what} but the query returned none.`);
  }
  return row;
};

export const PG_UNIQUE_VIOLATION = '23505';
export const PG_CHECK_VIOLATION = '23514';
export const PG_FOREIGN_KEY_VIOLATION = '23503';

export const isPgError = (
  error: unknown,
  code: string
): error is { code: string; constraint?: string } =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === code;
