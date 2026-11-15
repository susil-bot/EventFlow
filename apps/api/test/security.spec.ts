import express from 'express';
import request from 'supertest';
import { pool } from '../src/db/pool';
import { errorHandler } from '../src/middleware/error-handler';
import { rateLimit } from '../src/middleware/rate-limit';
import { requestId } from '../src/middleware/request-id';
import { app, createUser, resetDatabase } from './factories';
import { makeImage } from './images';

afterAll(() => pool.end());
beforeEach(resetDatabase);

let PNG: Buffer;
beforeAll(async () => {
  PNG = await makeImage('png');
});

describe('rateLimit middleware', () => {
  const limitedApp = (max: number) => {
    const limited = express();
    limited.post(
      '/attempt',
      rateLimit({ max, windowMs: 60_000 }),
      (_req, res) => {
        res.json({ data: 'ok' });
      }
    );
    limited.use(errorHandler);
    return limited;
  };

  it('allows requests up to the limit, then answers 429 with Retry-After', async () => {
    const limited = limitedApp(2);

    await request(limited).post('/attempt').expect(200);
    await request(limited).post('/attempt').expect(200);
    const blocked = await request(limited).post('/attempt').expect(429);

    expect(blocked.body.error.code).toBe('RATE_LIMITED');
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    expect(blocked.headers['ratelimit-remaining']).toBe('0');
  });
});

describe('upload hardening', () => {
  it('rejects form-style content types before reading the body', async () => {
    const organizer = await createUser('ORGANIZER');

    const response = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', organizer.cookie)
      .set('Content-Type', 'text/plain')
      .send(PNG.toString('binary'))
      .expect(415);

    expect(response.body.error.code).toBe('UNSUPPORTED_IMAGE');
  });

  it('serves uploaded files with a locked-down content security policy', async () => {
    const organizer = await createUser('ORGANIZER');
    const uploaded = await request(app)
      .post('/api/uploads/images')
      .set('Cookie', organizer.cookie)
      .set('Content-Type', 'image/png')
      .send(PNG)
      .expect(201);

    const file = await request(app).get(uploaded.body.data.url).expect(200);

    expect(file.headers['content-security-policy']).toContain('sandbox');
    expect(file.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('error responses', () => {
  it('never leaks internals for unknown routes or bad JSON', async () => {
    await request(app).get('/api/nope').expect(404);

    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":')
      .expect(400);

    expect(response.body.error).toEqual({
      code: 'VALIDATION_FAILED',
      message: 'Request body is not valid JSON.'
    });
  });
});

describe('request ids', () => {
  it('tags every response and reuses a safe incoming id', async () => {
    const fresh = await request(app).get('/api/events').expect(200);
    expect(fresh.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);

    const reused = await request(app)
      .get('/api/events')
      .set('X-Request-Id', 'trace-123')
      .expect(200);
    expect(reused.headers['x-request-id']).toBe('trace-123');

    const unsafe = await request(app)
      .get('/api/events')
      .set('X-Request-Id', 'bad id with spaces')
      .expect(200);
    expect(unsafe.headers['x-request-id']).not.toBe('bad id with spaces');
  });

  it('includes the request id in 500 responses without leaking internals', async () => {
    const failing = express();
    failing.use(requestId);
    failing.get('/boom', () => {
      throw new Error('SELECT secret FROM somewhere');
    });
    failing.use(errorHandler);

    const response = await request(failing).get('/boom').expect(500);

    expect(response.body.error).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Please try again.',
      requestId: response.headers['x-request-id']
    });
  });

  it('answers 503 when the database is unreachable', async () => {
    const failing = express();
    failing.use(requestId);
    failing.get('/db-down', () => {
      throw Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), {
        code: 'ECONNREFUSED'
      });
    });
    failing.use(errorHandler);

    const response = await request(failing).get('/db-down').expect(503);

    expect(response.body.error).toEqual({
      code: 'SERVICE_UNAVAILABLE',
      message:
        'EventFlow is temporarily unavailable. Please try again in a moment.',
      requestId: response.headers['x-request-id']
    });
  });
});
