import { DateTime } from 'luxon';
import { hashPassword } from '../modules/auth/password';
import { firstRow, pool, withTransaction } from './pool';
import { cultureEvents } from './seed-culture';
import { events as techEvents, users } from './seed-data';
import { showcaseEvents } from './seed-showcase';
import { VENUE_PINS } from './seed-venues';

const events = [...techEvents, ...cultureEvents, ...showcaseEvents];

export const SEED_PASSWORD = 'Password123!';

const hoursFromNow = (hours: number | undefined) =>
  hours === undefined ? null : DateTime.now().plus({ hours }).toUTC().toISO();

/**
 * `--if-empty` seeds only a database with no users yet (used when the
 * Docker stack starts, so a restart never wipes data). Without it the seed
 * replaces everything.
 */
const onlyIfEmpty = process.argv.includes('--if-empty');

const main = async () => {
  if (onlyIfEmpty) {
    const { rows } = await pool.query<{ has_users: boolean }>(
      'SELECT EXISTS (SELECT 1 FROM users) AS has_users'
    );
    if (rows[0]?.has_users) {
      console.log('Database already has data; skipping the demo seed.');
      return;
    }
  }
  await withTransaction(async (client) => {
    await client.query(
      'TRUNCATE admin_audit_log, registrations, event_slots, event_images, uploads, events, users CASCADE'
    );

    const passwordHash = await hashPassword(SEED_PASSWORD);
    const userIds = new Map<string, string>();

    for (const user of users) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          user.name,
          user.email,
          passwordHash,
          user.role,
          'status' in user ? user.status : 'ACTIVE'
        ]
      );
      userIds.set(user.email, firstRow(rows).id);
    }

    for (const event of events) {
      const day = DateTime.now()
        .setZone(event.timeZone)
        .plus({ days: event.daysFromNow })
        .set({ minute: 0, second: 0, millisecond: 0 });
      const slots = (event.slots ?? []).map((slot) => ({
        ...slot,
        startsAt: day.set({ hour: slot.hour }),
        endsAt: day.set({ hour: slot.hour + slot.hours })
      }));
      const startsAt = slots.reduce(
        (earliest, slot) =>
          slot.startsAt < earliest ? slot.startsAt : earliest,
        slots[0]?.startsAt ?? day.set({ hour: event.hour })
      );
      const capacity =
        slots.length > 0
          ? slots.reduce((total, slot) => total + slot.capacity, 0)
          : event.capacity;
      const attendeeCount =
        event.attendees.length +
        slots.reduce((total, slot) => total + slot.attendees.length, 0);

      const pin =
        event.eventType === 'ONLINE' ? undefined : VENUE_PINS[event.venue];

      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO events
           (organizer_id, title, description, starts_at, time_zone, venue,
            capacity, status, registered_count, slug, event_type, category,
            online_url, social_links, city_id, price_minor, publish_at,
            expires_at, venue_latitude, venue_longitude, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                 $14::jsonb, $15, $16, $17, $18, $19, $20, $1)
         RETURNING id`,
        [
          userIds.get(event.organizer),
          event.title,
          event.description,
          startsAt.toUTC().toISO(),
          event.timeZone,
          event.venue,
          capacity,
          event.status,
          attendeeCount,
          event.slug,
          event.eventType,
          event.category,
          event.onlineUrl ?? null,
          JSON.stringify(event.socialLinks ?? []),
          event.city ?? null,
          event.priceMinor ?? 0,
          hoursFromNow(event.publishInHours),
          hoursFromNow(event.expiresInHours),
          pin?.[0] ?? null,
          pin?.[1] ?? null
        ]
      );
      const eventId = firstRow(rows).id;

      for (const attendee of event.attendees) {
        await client.query(
          `INSERT INTO registrations (event_id, attendee_id) VALUES ($1, $2)`,
          [eventId, userIds.get(attendee)]
        );
      }

      for (const slot of slots) {
        const slotRows = await client.query<{ id: string }>(
          `INSERT INTO event_slots
             (event_id, label, starts_at, ends_at, capacity, registered_count)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            eventId,
            slot.label,
            slot.startsAt.toUTC().toISO(),
            slot.endsAt.toUTC().toISO(),
            slot.capacity,
            slot.attendees.length
          ]
        );
        for (const attendee of slot.attendees) {
          await client.query(
            `INSERT INTO registrations (event_id, attendee_id, slot_id)
             VALUES ($1, $2, $3)`,
            [eventId, userIds.get(attendee), firstRow(slotRows.rows).id]
          );
        }
      }
    }
  });

  console.log('Seed complete. Accounts (password for all: %s):', SEED_PASSWORD);
  console.table(
    users.map((user) => ({
      email: user.email,
      role: user.role,
      status: 'status' in user ? user.status : 'ACTIVE'
    }))
  );
};

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
