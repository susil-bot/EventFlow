import request from 'supertest';
import { pool } from '../src/db/pool';
import { app, createUser, PASSWORD, resetDatabase } from './factories';

afterAll(() => pool.end());
beforeEach(resetDatabase);

describe('auth', () => {
  it('signs up, sets an httpOnly session cookie and never returns the hash', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'New Person',
        email: 'NEW@Example.com',
        password: 'longenough',
        role: 'ATTENDEE'
      })
      .expect(201);

    expect(response.body.data).toEqual({
      id: expect.any(String),
      name: 'New Person',
      email: 'new@example.com',
      role: 'ATTENDEE',
      status: 'ACTIVE',
      homeCityId: null
    });
    expect(response.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);

    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE email = $1',
      ['new@example.com']
    );
    expect(rows[0].password_hash).not.toBe('longenough');
  });

  it('rejects a duplicate email case-insensitively', async () => {
    const user = await createUser('ATTENDEE');

    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Dup',
        email: user.email.toUpperCase(),
        password: PASSWORD,
        role: 'ATTENDEE'
      })
      .expect(409);

    expect(response.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rejects a wrong password with a generic message', async () => {
    const user = await createUser('ATTENDEE');

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrong-password' })
      .expect(401);

    expect(response.body.error).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password is incorrect.'
    });
  });

  it('returns field errors for invalid input', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: '', email: 'nope', password: 'short', role: 'ADMIN' })
      .expect(400);

    expect(Object.keys(response.body.error.details.fields).sort()).toEqual([
      'email',
      'name',
      'password',
      'role'
    ]);
  });

  it('protects /me and rejects tampered tokens', async () => {
    await request(app).get('/api/auth/me').expect(401);
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'em_session=not-a-real-token')
      .expect(401);
  });

  it('reports a signed-out session without an error', async () => {
    const response = await request(app).get('/api/auth/session').expect(200);

    expect(response.body).toEqual({ data: null });
  });

  it('returns the current user for a valid session', async () => {
    const user = await createUser('ORGANIZER');

    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', user.cookie)
      .expect(200);

    expect(response.body.data.role).toBe('ORGANIZER');
  });
});
