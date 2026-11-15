import { createApp } from './app';
import { config } from './config';
import { pool } from './db/pool';
import { logger } from './logger';

/** Requests still running after this long are cut off on shutdown. */
const SHUTDOWN_TIMEOUT_MS = 10_000;

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`API listening on http://localhost:${config.port}`);
  if (config.isProduction && !config.cookieSecure) {
    logger.warn(
      'COOKIE_SECURE=false: session cookies are sent over plain HTTP. Only do this for a local demo.'
    );
  }
});

server.on('error', (error: NodeJS.ErrnoException) => {
  const hint =
    error.code === 'EADDRINUSE'
      ? ` Port ${config.port} is already in use; stop the other process or set PORT.`
      : '';
  logger.fatal({ err: error }, `Could not start the API.${hint}`);
  process.exit(1);
});

let shuttingDown = false;

/**
 * Stops accepting connections, lets in-flight requests finish, closes the
 * database pool and exits. A timer forces the exit if something hangs.
 */
const shutdown = (reason: string, exitCode = 0) => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  logger.info(`${reason}, shutting down`);

  setTimeout(() => {
    logger.error('Shutdown timed out; forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  server.close(() => {
    pool
      .end()
      .catch((error: unknown) =>
        logger.error({ err: error }, 'Closing the database pool failed')
      )
      .finally(() => process.exit(exitCode));
  });
};

process.on('SIGINT', () => shutdown('SIGINT received'));
process.on('SIGTERM', () => shutdown('SIGTERM received'));

// A bug that escaped every handler leaves the process in an unknown state:
// log it loudly and restart cleanly rather than keep serving.
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  shutdown('Unhandled promise rejection', 1);
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  shutdown('Uncaught exception', 1);
});
