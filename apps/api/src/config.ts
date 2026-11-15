import 'dotenv/config';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgres://postgres:postgres@localhost:5432/events_dev'),
  TEST_DATABASE_URL: z
    .string()
    .url()
    .default('postgres://postgres:postgres@localhost:5432/events_test'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(12),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().max(20).default(5),
  /** Sign-in and sign-up requests allowed per IP per window. */
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().positive().default(15),
  /**
   * Express `trust proxy` setting. Set it (e.g. `1`) when the API runs behind
   * a reverse proxy so client IPs, used for rate limiting, are correct.
   */
  TRUST_PROXY: z.string().optional(),
  /**
   * Send the session cookie only over HTTPS (`Secure`). Defaults to on in
   * production. Turn it off only for a local HTTP demo such as the Docker
   * stack on http://localhost: Safari drops `Secure` cookies there.
   */
  COOKIE_SECURE: z
    .enum(['true', 'false'], { error: 'Use true or false.' })
    .optional()
});

/** Values copied from `.env.example` that must never reach production. */
const EXAMPLE_SECRETS = new Set([
  'change-me-to-a-long-random-string-of-32-chars'
]);

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const env = parsed.data;
const isTest = env.NODE_ENV === 'test';

if (env.NODE_ENV === 'production' && EXAMPLE_SECRETS.has(env.JWT_SECRET)) {
  throw new Error(
    'Invalid environment configuration:\n  - JWT_SECRET: still the example value; generate a random secret (e.g. `openssl rand -hex 32`).'
  );
}

/** `"1"` → 1, `"true"` → true, anything else is passed through (subnets). */
const parseTrustProxy = (value: string | undefined) => {
  if (value === undefined || value === '' || value === 'false') {
    return false;
  }
  if (value === 'true') {
    return true;
  }
  return /^\d+$/.test(value) ? Number(value) : value;
};

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isTest,
  port: env.PORT,
  databaseUrl: isTest ? env.TEST_DATABASE_URL : env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  sessionTtlHours: env.SESSION_TTL_HOURS,
  clientOrigin: env.CLIENT_ORIGIN,
  logLevel: isTest ? 'silent' : env.LOG_LEVEL,
  sessionCookieName: 'em_session',
  cookieSecure:
    env.COOKIE_SECURE === undefined
      ? env.NODE_ENV === 'production'
      : env.COOKIE_SECURE === 'true',
  // Tests write uploads to a throwaway folder, never the dev uploads folder.
  uploadDir: isTest
    ? path.join(os.tmpdir(), 'event-management-test-uploads')
    : path.resolve(env.UPLOAD_DIR),
  maxUploadBytes: Math.round(env.MAX_UPLOAD_MB * 1024 * 1024),
  /** URL prefix the API serves uploaded files under. */
  uploadsPublicPath: '/uploads',
  trustProxy: parseTrustProxy(env.TRUST_PROXY),
  authRateLimit: {
    // Tests sign up many users from one IP; they exercise the limiter
    // directly instead.
    max: isTest ? 10_000 : env.AUTH_RATE_LIMIT_MAX,
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  }
} as const;

export type AppConfig = typeof config;
