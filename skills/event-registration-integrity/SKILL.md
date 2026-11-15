---
name: event-registration-integrity
description: Rules for registration, capacity and concurrency correctness. Use whenever changing registration create/cancel, event capacity edits, event status transitions, or the events/registrations schema.
license: MIT
metadata:
    author: event-management-app
    version: '1.1'
---

# Registration Integrity

## Invariants (enforced by the database, not only the app)

1. `events.capacity > 0`
2. `0 <= events.registered_count <= events.capacity`
3. At most one `ACTIVE` registration per `(event_id, attendee_id)` — partial
   unique index `registrations_one_active_per_attendee`.
4. `events.registered_count` equals the number of `ACTIVE` registrations.

## Register (inside one transaction)

```sql
UPDATE events
   SET registered_count = registered_count + 1
 WHERE id = $1
   -- liveCondition(): published, past go-live, not expired, not started
   AND status = 'PUBLISHED'
   AND (publish_at IS NULL OR publish_at <= now())
   AND (expires_at IS NULL OR expires_at > now())
   AND starts_at > now()
   AND registered_count < capacity
RETURNING *;
```

- Zero rows → load the event and explain why (`EVENT_NOT_FOUND` for drafts
  and scheduled events, `EVENT_NOT_OPEN` for an expired listing,
  `EVENT_CANCELED`, `EVENT_STARTED`, `EVENT_FULL`).
- Then `INSERT` the registration. A `23505` unique violation means
  `ALREADY_REGISTERED`; the transaction rolls back, undoing the increment.
- Postgres row locks serialise concurrent `UPDATE`s on the same event and
  re-check the `WHERE` clause after the lock is acquired, so the last seat can
  only be taken once.
- "Live" is defined once, in `liveCondition()`
  (`events/repository/columns.ts`). Discovery and counts use the same rule;
  never re-implement it.

## Cancel registration

- Flip `ACTIVE → CANCELED` with a conditional `UPDATE … WHERE status =
  'ACTIVE' AND attendee_id = $user` and decrement `registered_count` in the
  same transaction. Idempotent double-cancel returns `409
  REGISTRATION_NOT_ACTIVE`.

## Capacity edits

- `UPDATE events SET capacity = $new WHERE id = $id AND registered_count <=
  $new` — never compare in application code first.

## Status transitions

- Publish: `UPDATE … SET status = 'PUBLISHED' WHERE status = 'DRAFT' AND
  starts_at > now() AND (expires_at IS NULL OR expires_at > now())`.
- Unpublish: `UPDATE … SET status = 'DRAFT' WHERE status = 'PUBLISHED' AND
  registered_count = 0` — attendees are never left with a hidden event;
  cancel instead (`409 EVENT_HAS_REGISTRATIONS`).

## Never

- Never compute availability from a `SELECT` and then write.
- Never remove the partial unique index or the `CHECK` constraints.
- Never skip the concurrency test in `apps/api/test/registrations.spec.ts`.
