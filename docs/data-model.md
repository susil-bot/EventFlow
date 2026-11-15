# Data Model

PostgreSQL 16. Schema lives in `apps/api/src/db/migrations/` (`001_init.sql`
to `005_categories_and_price.sql`, applied in order).

```text
cities 1 ──< events (city_id)        cities 1 ──< users (home_city_id)
users 1 ──< events (organizer_id)
users 1 ──< registrations (attendee_id) >── 1 events
events 1 ──< event_slots 1 ──< registrations (slot_id, optional)
users 1 ──< uploads 1 ──< event_images >── 1 events
```

## users

| Column              | Type             | Notes                                          |
| ------------------- | ---------------- | ---------------------------------------------- |
| `id`                | uuid PK          | `gen_random_uuid()`                            |
| `name`              | text             | non-blank                                      |
| `email`             | text             | unique on `lower(email)` (case-insensitive)    |
| `password_hash`     | text             | bcrypt, 10 rounds; never leaves the repository |
| `role`              | `user_role`      | `ORGANIZER` \| `ATTENDEE` \| `ADMIN`           |
| `status`            | `account_status` | `ACTIVE` \| `PENDING_APPROVAL` \| `SUSPENDED`  |
| `status_changed_at` | timestamptz      | set when an admin changes the status           |
| `home_city_id`      | text FK cities   | Discover city; `ON DELETE SET NULL`            |
| `created_at`        | timestamptz      |                                                |

No age, sex or other demographic data is stored (data minimisation; no feature
needs it).

## events

| Column             | Type           | Notes                                                             |
| ------------------ | -------------- | ----------------------------------------------------------------- |
| `id`               | uuid PK        |                                                                   |
| `organizer_id`     | uuid FK users  | owner; all management is checked against this                     |
| `title`            | text           | non-blank, ≤ 150 (API)                                            |
| `description`      | text           | non-blank, ≤ 5000 (API)                                           |
| `starts_at`        | timestamptz    | the UTC instant                                                   |
| `time_zone`        | text           | IANA zone the organizer entered the time in                       |
| `venue`            | text           | non-blank                                                         |
| `capacity`         | integer        | `CHECK (capacity > 0)`                                            |
| `registered_count` | integer        | active registrations; `CHECK (0 <= count <= capacity)`            |
| `status`           | `event_status` | `DRAFT` → `PUBLISHED` → `CANCELED` (or `DRAFT` → `CANCELED`)      |
| `event_type`       | text           | `IN_PERSON` \| `ONLINE` \| `HYBRID` (`CHECK`)                     |
| `category`         | text           | fixed list of 14 (`CHECK`), e.g. `WORKSHOP`, `MUSIC_SHOW`         |
| `city_id`          | text FK cities | required unless `ONLINE` (`CHECK`); `ON DELETE RESTRICT`          |
| `price_minor`      | integer        | ticket price in paise, 0 = free, ≤ 10,000,000                     |
| `currency`         | char(3)        | `INR` only for now                                                |
| `slug`             | text           | unique, `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–80 chars                    |
| `online_url`       | text           | meeting link; null for in-person events                           |
| `social_links`     | jsonb          | `[{ platform, url }]`                                             |
| `publish_at`       | timestamptz    | go-live time; null = live when published; `< starts_at`           |
| `expires_at`       | timestamptz    | listing end; null = until start; `<= starts_at`, `> publish_at`   |
| `updated_by`       | uuid → users   | last editor (organizer or admin); `ON DELETE SET NULL` (mig. 007) |
| `venue_latitude`   | float8         | venue map pin, `-90..90`; set together with longitude (mig. 008)  |
| `venue_longitude`  | float8         | venue map pin, `-180..180`; both null = no pin                    |
| `created_at`       | timestamptz    |                                                                   |
| `updated_at`       | timestamptz    |                                                                   |

An event is **live** when `status = 'PUBLISHED'`, `publish_at` is null or
past, `expires_at` is null or in the future, and `starts_at` is in the
future. This is evaluated in every query (`liveCondition` in
`events/repository/columns.ts`), so scheduling and expiry need no
background job. Migration 006 adds the columns and checks, and extends the
admin audit actions with `EDIT_EVENT`, `PUBLISH_EVENT` and
`UNPUBLISH_EVENT`.

Indexes: `(organizer_id, starts_at)` for the dashboard,
`(status, starts_at)` for the public listing, `(city_id, starts_at)` for
city discovery and `(status, category, starts_at)` (published only) for
category filters and counts.

The city check is added `NOT VALID`: it applies to every new or changed
row without failing the migration on old rows that have no city yet.

### Why money in minor units?

`price_minor` is an integer number of paise, so prices never pick up
floating-point rounding. The API sends `{ amountMinor, currency }` and the
browser formats it ("₹399", "Free").

### Why store both `starts_at` and `time_zone`?

`starts_at` is the unambiguous instant used for comparisons ("has it
started?"). `time_zone` preserves the organizer's intent so the event is
always displayed in its local time ("6:00 PM IST") and the edit form shows
the wall-clock time they typed. Wall-clock input is converted with Luxon on
the server; times that do not exist because of a DST jump are rejected.

### Why a denormalised `registered_count`?

It lets one conditional `UPDATE` both check and take a place atomically (see
`design-decisions.md`). It is changed only inside the same transaction as the
registration row, and integration tests assert it always equals the number of
`ACTIVE` registrations.

## cities

Reference data seeded by migration 004 (10 popular Indian cities in this
demo).

| Column                     | Type             | Notes                                          |
| -------------------------- | ---------------- | ---------------------------------------------- |
| `id`                       | text PK          | slug used in URLs and the API (`chennai`)      |
| `name`                     | text             | unique                                         |
| `state`, `country_code`    | text             |                                                |
| `latitude`, `longitude`    | double precision | city centre                                    |
| `time_zone`                | text             | IANA zone; prefills the event form             |
| `aliases`                  | text[]           | other names people search for (Bombay, Madras) |
| `is_popular`, `sort_order` |                  | picker order                                   |

`distance_km(lat1, lon1, lat2, lon2)` is an immutable SQL haversine
function. Distances are city centre to city centre: events have no exact
coordinates, and the visitor's own position is never stored or sent.

## registrations

| Column        | Type                  | Notes                                  |
| ------------- | --------------------- | -------------------------------------- |
| `id`          | uuid PK               |                                        |
| `event_id`    | uuid FK events        | cascade delete                         |
| `attendee_id` | uuid FK users         | cascade delete                         |
| `status`      | `registration_status` | `ACTIVE` \| `CANCELED`                 |
| `created_at`  | timestamptz           | shown to organizers as "registered at" |
| `canceled_at` | timestamptz           | `CHECK` keeps it in sync with `status` |

**Partial unique index** `registrations_one_active_per_attendee` on
`(event_id, attendee_id) WHERE status = 'ACTIVE'`: an attendee can hold at
most one active registration per event, while canceled rows are kept as
history and do not block re-registering.

`registrations.slot_id` (nullable FK `event_slots`) records the chosen time
slot when the event has slots.

## event_slots

| Column             | Type        | Notes                                                  |
| ------------------ | ----------- | ------------------------------------------------------ |
| `id`               | uuid PK     |                                                        |
| `event_id`         | uuid FK     | cascade delete                                         |
| `label`            | text        | e.g. "Morning batch"                                   |
| `starts_at`        | timestamptz | unique per event                                       |
| `ends_at`          | timestamptz | `CHECK (ends_at > starts_at)`                          |
| `capacity`         | integer     | `CHECK (capacity > 0)`                                 |
| `registered_count` | integer     | active registrations; `CHECK (0 <= count <= capacity)` |

When an event has slots, `events.capacity` is the sum of slot capacities and
`events.starts_at` the earliest slot start, so the event-level guard keeps
working. Registering takes a place on the event row first and then on the
slot row with the same conditional `UPDATE`, always in that order, inside
one transaction.

## uploads and event_images

`uploads` records each stored image (owner, random file name, detected MIME
type, size). `event_images (event_id, upload_id, position)` orders an event's
images; position 0 is the cover. Only the uploading organizer can attach an
image.

## admin_audit_log

Append-only record of admin actions, written in the same transaction as the
change it describes.

| Column        | Type          | Notes                                                                                 |
| ------------- | ------------- | ------------------------------------------------------------------------------------- |
| `id`          | uuid PK       |                                                                                       |
| `admin_id`    | uuid FK users | `ON DELETE RESTRICT` (history can't be orphaned)                                      |
| `action`      | text          | `APPROVE_ORGANIZER`, `SUSPEND_USER`, `REACTIVATE_USER`, `CHANGE_ROLE`, `CANCEL_EVENT` |
| `target_type` | text          | `USER` \| `EVENT`                                                                     |
| `target_id`   | uuid          |                                                                                       |
| `reason`      | text          | required for suspensions and event cancellations                                      |
| `metadata`    | jsonb         | e.g. `{ from: {role, status}, to: {role, status} }`                                   |
| `created_at`  | timestamptz   | indexed (newest first)                                                                |

`events.cancellation_reason` (text, nullable) holds the reason shown to
attendees when an admin cancels an event.
