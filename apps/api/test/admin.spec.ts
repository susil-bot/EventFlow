import request from 'supertest';
import { pool } from '../src/db/pool';
import {
  app,
  createEvent,
  createUser,
  register,
  resetDatabase,
  type TestUser
} from './factories';

afterAll(() => pool.end());
beforeEach(resetDatabase);

const asAdmin = (admin: TestUser) => ({
  get: (path: string) =>
    request(app).get(`/api/admin${path}`).set('Cookie', admin.cookie),
  post: (path: string, body?: object) =>
    request(app)
      .post(`/api/admin${path}`)
      .set('Cookie', admin.cookie)
      .send(body),
  patch: (path: string, body: object) =>
    request(app)
      .patch(`/api/admin${path}`)
      .set('Cookie', admin.cookie)
      .send(body)
});

const auditActions = async () =>
  (
    await pool.query<{ action: string; reason: string | null }>(
      'SELECT action, reason FROM admin_audit_log ORDER BY created_at'
    )
  ).rows;

describe('admin: users', () => {
  it('lists users with filters and search, never exposing password hashes', async () => {
    const admin = await createUser('ADMIN');
    await createUser('ORGANIZER', 'Pending Pat', {
      status: 'PENDING_APPROVAL'
    });
    await createUser('ATTENDEE', 'Asha');

    const pending = await asAdmin(admin)
      .get('/users?status=PENDING_APPROVAL')
      .expect(200);
    expect(pending.body.data.total).toBe(1);
    expect(pending.body.data.items[0]).toMatchObject({
      name: 'Pending Pat',
      role: 'ORGANIZER',
      status: 'PENDING_APPROVAL'
    });

    const search = await asAdmin(admin).get('/users?search=ash').expect(200);
    expect(search.body.data.items.map((u: { name: string }) => u.name)).toEqual(
      ['Asha']
    );
    expect(JSON.stringify(search.body)).not.toMatch(/password/i);

    await asAdmin(admin).get('/users?limit=500').expect(400);
  });

  it('approves a pending organizer once and records it', async () => {
    const admin = await createUser('ADMIN');
    const organizer = await createUser('ORGANIZER', undefined, {
      status: 'PENDING_APPROVAL'
    });

    const approved = await asAdmin(admin)
      .post(`/users/${organizer.id}/approve`)
      .expect(200);
    expect(approved.body.data.status).toBe('ACTIVE');

    const again = await asAdmin(admin)
      .post(`/users/${organizer.id}/approve`)
      .expect(409);
    expect(again.body.error.code).toBe('INVALID_USER_TRANSITION');
    expect(await auditActions()).toEqual([
      { action: 'APPROVE_ORGANIZER', reason: null }
    ]);
  });

  it('suspends with a reason and reactivates', async () => {
    const admin = await createUser('ADMIN');
    const attendee = await createUser('ATTENDEE');

    await asAdmin(admin).post(`/users/${attendee.id}/suspend`, {}).expect(400);
    const suspended = await asAdmin(admin)
      .post(`/users/${attendee.id}/suspend`, { reason: 'Spam sign-ups' })
      .expect(200);
    expect(suspended.body.data.status).toBe('SUSPENDED');
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', attendee.cookie)
      .expect(401);

    await asAdmin(admin).post(`/users/${attendee.id}/reactivate`).expect(200);
    expect(await auditActions()).toEqual([
      { action: 'SUSPEND_USER', reason: 'Spam sign-ups' },
      { action: 'REACTIVATE_USER', reason: null }
    ]);
  });

  it('refuses to act on itself, on other admins or on unknown users', async () => {
    const admin = await createUser('ADMIN');
    const otherAdmin = await createUser('ADMIN');
    const reason = { reason: 'Testing limits' };

    const self = await asAdmin(admin)
      .post(`/users/${admin.id}/suspend`, reason)
      .expect(409);
    expect(self.body.error.code).toBe('INVALID_USER_TRANSITION');
    await asAdmin(admin)
      .post(`/users/${otherAdmin.id}/suspend`, reason)
      .expect(409);
    await asAdmin(admin)
      .post('/users/00000000-0000-4000-8000-000000000000/suspend', reason)
      .expect(404);
    expect(await auditActions()).toEqual([]);
  });

  it('changes roles only when no events or registrations would be stranded', async () => {
    const admin = await createUser('ADMIN');
    const organizer = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(organizer);
    await register(eventId, attendee).expect(201);

    const organizerBlocked = await asAdmin(admin)
      .patch(`/users/${organizer.id}/role`, { role: 'ATTENDEE' })
      .expect(409);
    expect(organizerBlocked.body.error.code).toBe('USER_HAS_ACTIVE_EVENTS');
    const attendeeBlocked = await asAdmin(admin)
      .patch(`/users/${attendee.id}/role`, { role: 'ORGANIZER' })
      .expect(409);
    expect(attendeeBlocked.body.error.code).toBe(
      'USER_HAS_ACTIVE_REGISTRATIONS'
    );
    await asAdmin(admin)
      .patch(`/users/${attendee.id}/role`, { role: 'ADMIN' })
      .expect(400);

    const fresh = await createUser('ATTENDEE');
    const promoted = await asAdmin(admin)
      .patch(`/users/${fresh.id}/role`, { role: 'ORGANIZER' })
      .expect(200);
    expect(promoted.body.data).toMatchObject({
      role: 'ORGANIZER',
      status: 'ACTIVE'
    });
    const { rows } = await pool.query(
      `SELECT metadata FROM admin_audit_log WHERE action = 'CHANGE_ROLE'`
    );
    expect(rows[0].metadata).toEqual({
      from: { role: 'ATTENDEE', status: 'ACTIVE' },
      to: { role: 'ORGANIZER', status: 'ACTIVE' }
    });
  });
});

describe('admin: events and overview', () => {
  it('sees every event, drafts included, and can open a draft page', async () => {
    const admin = await createUser('ADMIN');
    const organizer = await createUser('ORGANIZER');
    const draftId = await createEvent(organizer, { status: 'DRAFT' });
    await createEvent(organizer);

    const all = await asAdmin(admin).get('/events').expect(200);
    expect(all.body.data).toHaveLength(2);
    const drafts = await asAdmin(admin).get('/events?status=DRAFT').expect(200);
    expect(drafts.body.data.map((e: { id: string }) => e.id)).toEqual([
      draftId
    ]);

    await request(app)
      .get(`/api/events/${draftId}`)
      .set('Cookie', admin.cookie)
      .expect(200);
  });

  it("cancels any organizer's event with a reason attendees can see", async () => {
    const admin = await createUser('ADMIN');
    const organizer = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(organizer);
    await register(eventId, attendee).expect(201);

    await asAdmin(admin).post(`/events/${eventId}/cancel`, {}).expect(400);
    const canceled = await asAdmin(admin)
      .post(`/events/${eventId}/cancel`, { reason: 'Venue closed' })
      .expect(200);
    expect(canceled.body.data).toMatchObject({
      status: 'CANCELED',
      cancellationReason: 'Venue closed'
    });

    const mine = await request(app)
      .get('/api/me/registrations')
      .set('Cookie', attendee.cookie)
      .expect(200);
    expect(mine.body.data[0].event.cancellationReason).toBe('Venue closed');
    await asAdmin(admin)
      .post(`/events/${eventId}/cancel`, { reason: 'Again' })
      .expect(409);
  });

  it('reports platform stats and the audit log, newest first', async () => {
    const admin = await createUser('ADMIN');
    const pending = await createUser('ORGANIZER', undefined, {
      status: 'PENDING_APPROVAL'
    });
    const organizer = await createUser('ORGANIZER');
    const attendee = await createUser('ATTENDEE');
    const eventId = await createEvent(organizer);
    await createEvent(organizer, { status: 'DRAFT' });
    await register(eventId, attendee).expect(201);

    const stats = await asAdmin(admin).get('/stats').expect(200);
    expect(stats.body.data).toEqual({
      users: { ORGANIZER: 2, ATTENDEE: 1, ADMIN: 1 },
      pendingOrganizers: 1,
      suspendedUsers: 0,
      events: { DRAFT: 1, PUBLISHED: 1, CANCELED: 0 },
      upcomingPublishedEvents: 1,
      activeRegistrations: 1
    });

    await asAdmin(admin).post(`/users/${pending.id}/approve`).expect(200);
    await asAdmin(admin)
      .post(`/users/${attendee.id}/suspend`, { reason: 'Abuse report' })
      .expect(200);
    const log = await asAdmin(admin).get('/audit-log').expect(200);
    expect(log.body.data.map((e: { action: string }) => e.action)).toEqual([
      'SUSPEND_USER',
      'APPROVE_ORGANIZER'
    ]);
    expect(log.body.data[0]).toMatchObject({
      adminId: admin.id,
      targetType: 'USER',
      targetId: attendee.id,
      reason: 'Abuse report'
    });
  });
});
