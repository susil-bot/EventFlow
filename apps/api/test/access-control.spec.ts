import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { config } from '../src/config';
import { pool } from '../src/db/pool';
import type { Role } from '../src/modules/auth/types';
import {
  app,
  createEvent,
  createUser,
  PASSWORD,
  register,
  resetDatabase,
  type TestUser,
  validEventBody
} from './factories';

afterAll(() => pool.end());
beforeEach(resetDatabase);

type Method = 'get' | 'post' | 'patch';
type Route = { method: Method; path: string; allowed: Role[] };

const id = randomUUID();

/**
 * Every protected route and the roles allowed to call it. Authorization runs
 * before validation and lookups, so placeholder ids are enough here; the
 * success paths are covered by the feature test suites.
 */
const PROTECTED_ROUTES: Route[] = [
  {
    method: 'patch',
    path: '/api/auth/me/home-city',
    allowed: ['ORGANIZER', 'ATTENDEE', 'ADMIN']
  },
  { method: 'post', path: '/api/events', allowed: ['ORGANIZER'] },
  {
    method: 'patch',
    path: `/api/events/${id}`,
    allowed: ['ORGANIZER', 'ADMIN']
  },
  {
    method: 'post',
    path: `/api/events/${id}/publish`,
    allowed: ['ORGANIZER', 'ADMIN']
  },
  {
    method: 'post',
    path: `/api/events/${id}/unpublish`,
    allowed: ['ORGANIZER', 'ADMIN']
  },
  { method: 'post', path: `/api/events/${id}/cancel`, allowed: ['ORGANIZER'] },
  { method: 'get', path: '/api/organizer/events', allowed: ['ORGANIZER'] },
  {
    method: 'get',
    path: `/api/organizer/events/${id}/attendees`,
    allowed: ['ORGANIZER']
  },
  { method: 'post', path: '/api/uploads/images', allowed: ['ORGANIZER'] },
  {
    method: 'post',
    path: `/api/events/${id}/registrations`,
    allowed: ['ATTENDEE']
  },
  {
    method: 'post',
    path: `/api/registrations/${id}/cancel`,
    allowed: ['ATTENDEE']
  },
  { method: 'get', path: '/api/me/registrations', allowed: ['ATTENDEE'] },
  { method: 'get', path: '/api/admin/stats', allowed: ['ADMIN'] },
  { method: 'get', path: '/api/admin/users', allowed: ['ADMIN'] },
  {
    method: 'post',
    path: `/api/admin/users/${id}/approve`,
    allowed: ['ADMIN']
  },
  {
    method: 'post',
    path: `/api/admin/users/${id}/suspend`,
    allowed: ['ADMIN']
  },
  {
    method: 'post',
    path: `/api/admin/users/${id}/reactivate`,
    allowed: ['ADMIN']
  },
  { method: 'patch', path: `/api/admin/users/${id}/role`, allowed: ['ADMIN'] },
  { method: 'get', path: '/api/admin/events', allowed: ['ADMIN'] },
  {
    method: 'post',
    path: `/api/admin/events/${id}/cancel`,
    allowed: ['ADMIN']
  },
  { method: 'get', path: '/api/admin/audit-log', allowed: ['ADMIN'] }
];

const ROLES: Role[] = ['ORGANIZER', 'ATTENDEE', 'ADMIN'];

const call = ({ method, path }: Route, cookie?: string) => {
  const pending = request(app)[method](path);
  return cookie ? pending.set('Cookie', cookie) : pending;
};

describe('route protection matrix', () => {
  let users: Record<Role, TestUser>;

  beforeEach(async () => {
    users = {
      ORGANIZER: await createUser('ORGANIZER'),
      ATTENDEE: await createUser('ATTENDEE'),
      ADMIN: await createUser('ADMIN')
    };
  });

  it.each(PROTECTED_ROUTES.map((route) => [route.method, route.path, route]))(
    '%s %s rejects anonymous callers and the wrong roles',
    async (_method, _path, route) => {
      const anonymous = await call(route);
      expect(anonymous.status).toBe(401);
      expect(anonymous.body.error.code).toBe('UNAUTHENTICATED');

      for (const role of ROLES.filter((r) => !route.allowed.includes(r))) {
        const response = await call(route, users[role].cookie);
        expect({ role, status: response.status }).toEqual({
          role,
          status: 403
        });
        expect(response.body.error.code).toBe('FORBIDDEN');
      }

      // Allowed roles get past the guards (they may still fail validation
      // or lookups with the placeholder ids).
      for (const role of route.allowed) {
        const response = await call(route, users[role].cookie);
        expect([401, 403]).not.toContain(response.status);
      }
    }
  );
});

describe('session tokens', () => {
  const sign = (
    payload: object,
    options: jwt.SignOptions,
    secret = config.jwtSecret
  ) => `em_session=${jwt.sign(payload, secret, options)}`;

  it('rejects expired, foreign-signed and unsigned tokens', async () => {
    const user = await createUser('ATTENDEE');
    const expired = sign({}, { subject: user.id, expiresIn: -10 });
    const foreign = sign(
      {},
      { subject: user.id },
      'another-secret-that-is-long-enough-to-sign'
    );
    const encode = (part: object) =>
      Buffer.from(JSON.stringify(part)).toString('base64url');
    const unsigned = `em_session=${encode({ alg: 'none', typ: 'JWT' })}.${encode(
      { sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 }
    )}.`;

    for (const cookie of [expired, foreign, unsigned]) {
      await request(app).get('/api/auth/me').set('Cookie', cookie).expect(401);
    }
  });

  it('rejects a valid token for a user that no longer exists', async () => {
    const user = await createUser('ATTENDEE');
    await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

    await request(app)
      .get('/api/auth/me')
      .set('Cookie', user.cookie)
      .expect(401);
  });
});

describe('changes take effect immediately', () => {
  it('ends an existing session as soon as the account is suspended', async () => {
    const attendee = await createUser('ATTENDEE');
    await request(app)
      .get('/api/me/registrations')
      .set('Cookie', attendee.cookie)
      .expect(200);

    await pool.query("UPDATE users SET status = 'SUSPENDED' WHERE id = $1", [
      attendee.id
    ]);

    const response = await request(app)
      .get('/api/me/registrations')
      .set('Cookie', attendee.cookie)
      .expect(401);
    expect(response.headers['set-cookie']?.[0]).toMatch(/em_session=;/);
    const session = await request(app)
      .get('/api/auth/session')
      .set('Cookie', attendee.cookie)
      .expect(200);
    expect(session.body.data).toBeNull();
  });

  it('applies a role change to the next request on the same session', async () => {
    const user = await createUser('ORGANIZER');
    await request(app)
      .get('/api/organizer/events')
      .set('Cookie', user.cookie)
      .expect(200);

    await pool.query("UPDATE users SET role = 'ATTENDEE' WHERE id = $1", [
      user.id
    ]);

    await request(app)
      .get('/api/organizer/events')
      .set('Cookie', user.cookie)
      .expect(403);
    await request(app)
      .get('/api/me/registrations')
      .set('Cookie', user.cookie)
      .expect(200);
  });
});

describe('sign-up and sign-in rules', () => {
  it('does not let anyone sign up as an admin', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Sneaky',
        email: 'sneaky@example.com',
        password: PASSWORD,
        role: 'ADMIN'
      })
      .expect(400);

    expect(response.body.error.details.fields.role).toBeDefined();
  });

  it('keeps a new organizer pending until an admin approves them', async () => {
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'New Organizer',
        email: 'new-org@example.com',
        password: PASSWORD,
        role: 'ORGANIZER'
      })
      .expect(201);
    expect(signup.body.data.status).toBe('PENDING_APPROVAL');
    const cookie = (
      signup.headers['set-cookie'] as unknown as string[]
    )[0]!.split(';')[0]!;

    const blocked = await request(app)
      .post('/api/events')
      .set('Cookie', cookie)
      .send(validEventBody())
      .expect(403);
    expect(blocked.body.error.code).toBe('ACCOUNT_PENDING_APPROVAL');

    const admin = await createUser('ADMIN');
    await request(app)
      .post(`/api/admin/users/${signup.body.data.id}/approve`)
      .set('Cookie', admin.cookie)
      .expect(200);

    // Same session, no new sign-in needed.
    await request(app)
      .post('/api/events')
      .set('Cookie', cookie)
      .send(validEventBody())
      .expect(201);
  });

  it('tells a suspended user why, but only after a correct password', async () => {
    const user = await createUser('ATTENDEE');
    await pool.query("UPDATE users SET status = 'SUSPENDED' WHERE id = $1", [
      user.id
    ]);

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'not-the-password' })
      .expect(401);
    expect(wrongPassword.body.error.code).toBe('INVALID_CREDENTIALS');

    const rightPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: PASSWORD })
      .expect(403);
    expect(rightPassword.body.error.code).toBe('ACCOUNT_SUSPENDED');
  });
});

describe('data isolation', () => {
  it("never shows one attendee another attendee's registrations", async () => {
    const owner = await createUser('ORGANIZER');
    const asha = await createUser('ATTENDEE');
    const arjun = await createUser('ATTENDEE');
    const first = await createEvent(owner);
    const second = await createEvent(owner);
    await register(first, asha).expect(201);
    await register(second, arjun).expect(201);

    const mine = await request(app)
      .get('/api/me/registrations')
      .set('Cookie', asha.cookie)
      .expect(200);

    expect(
      mine.body.data.map((item: { event: { id: string } }) => item.event.id)
    ).toEqual([first]);
  });

  it("lists only the organizer's own events on their dashboard", async () => {
    const olivia = await createUser('ORGANIZER');
    const oscar = await createUser('ORGANIZER');
    const hers = await createEvent(olivia, { status: 'DRAFT' });
    await createEvent(oscar, { status: 'DRAFT' });

    const response = await request(app)
      .get('/api/organizer/events')
      .set('Cookie', olivia.cookie)
      .expect(200);

    expect(response.body.data.map((event: { id: string }) => event.id)).toEqual(
      [hers]
    );
  });
});
