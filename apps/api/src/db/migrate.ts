import { pool } from './pool';
import { dropSchema, runMigrations } from './migrator';

const main = async () => {
  if (process.argv.includes('--reset')) {
    await dropSchema(pool);
    console.log('Dropped existing schema.');
  }
  const applied = await runMigrations(pool);
  console.log(
    applied.length
      ? `Applied migrations: ${applied.join(', ')}`
      : 'Database is up to date.'
  );
};

main()
  .catch((error: unknown) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
