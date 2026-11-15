import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { config } from './config';
import { pool } from './db/pool';
import { logger } from './logger';
import { AppError, ErrorCode } from './errors/app-error';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestId } from './middleware/request-id';
import { adminRouter } from './modules/admin/routes';
import { authRouter } from './modules/auth/routes';
import { citiesRouter } from './modules/cities/routes';
import { eventsRouter, organizerRouter } from './modules/events/routes';
import { registrationsRouter } from './modules/registrations/routes';
import { uploadsRouter } from './modules/uploads/routes';

/** Builds the Express app without binding a port (used by tests). */
export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(requestId);
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  if (!config.isTest) {
    app.use(
      pinoHttp({
        logger,
        genReqId: (req) => req.requestId ?? '',
        // Container health checks hit this every few seconds; keep them out
        // of the logs.
        autoLogging: { ignore: (req) => req.url === '/api/health' }
      })
    );
  }

  // Liveness + database check for load balancers and uptime monitors.
  app.get('/api/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
    } catch (error) {
      logger.error({ err: error }, 'Health check: database unreachable');
      throw new AppError(
        503,
        ErrorCode.SERVICE_UNAVAILABLE,
        'The database is not reachable.'
      );
    }
    res.json({ data: { status: 'ok' } });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/cities', citiesRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/organizer', organizerRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', registrationsRouter);

  // Uploaded promo images from the local-disk store (`uploads/storage`).
  // Every file is a re-encoded image under a random UUID name; no directory
  // listing, no dotfiles, and a CSP that stops any file from running script
  // even if it is opened directly. With the S3 store this route goes away:
  // a CDN serves the objects with the same type and caching headers.
  app.use(
    config.uploadsPublicPath,
    express.static(config.uploadDir, {
      index: false,
      dotfiles: 'deny',
      maxAge: '7d',
      immutable: true,
      setHeaders: (res) => {
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'none'; img-src 'self'; sandbox"
        );
      }
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
