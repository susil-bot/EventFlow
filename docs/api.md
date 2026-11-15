# API Reference

Base URL: `http://localhost:4000/api` (the web app reaches it through the
Vite proxy at `/api`).

- Auth: an `httpOnly`, `SameSite=Lax` cookie `em_session` holding a signed
  JWT (HS256), set by `login`/`signup`.
- Success: `{ "data": ... }`.
- Error: `{ "error": { "code": "EVENT_FULL", "message": "...", "details"? } }`.
  Validation errors put per-field messages in `details.fields`.
- Every response carries an `X-Request-Id` header (a safe incoming one is
  reused). 500 responses also include it as `error.requestId`.

## Auth

| Method | Path                 | Access    | Description                                                                                                                     |
| ------ | -------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/signup`       | public    | `{ name, email, password, role: ORGANIZER \| ATTENDEE }` → 201; organizers start `PENDING_APPROVAL`                             |
| POST   | `/auth/login`        | public    | `{ email, password }`                                                                                                           |
| POST   | `/auth/logout`       | public    | clears the cookie → 204                                                                                                         |
| GET    | `/auth/session`      | public    | current user (`id, name, email, role, status`) or `null`                                                                        |
| GET    | `/auth/me`           | signed in | current user (401 if signed out)                                                                                                |
| PATCH  | `/auth/me/home-city` | signed in | `{ cityId: string \| null }` → updated user; saves the Discover city across devices (`400` `fields.cityId` for an unknown city) |

The session user also carries `homeCityId` (`null` until chosen).

## Cities

| Method | Path      | Access | Description                                                                                                                                               |
| ------ | --------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/cities` | public | supported cities, popular first: `{ id, name, state, countryCode, latitude, longitude, timeZone, aliases[], isPopular, upcomingEventCount }`; cached 60 s |

`id` is a slug (`chennai`, `delhi-ncr`) used in event bodies, discovery and
Discover URLs. The visitor's exact position never reaches the API: the
browser picks the nearest city itself and only the city id is sent.

## Events

| Method | Path                    | Access          | Description                                                                                                                        |
| ------ | ----------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/events`               | public          | discovery: **live** events, filtered and paged (see below) → `{ items, total, limit, offset }`                                     |
| GET    | `/events/facets`        | public          | events per category for the same filters (the category filter itself is ignored) → `{ categories: [{ category, count }], total }`  |
| GET    | `/events/:id`           | public\*        | event details by id **or slug** (\*drafts and scheduled events only for their organizer and admins)                                |
| POST   | `/events`               | organizer       | create; `publish: true` publishes (live now, or at `publishAtLocal`)                                                               |
| PATCH  | `/events/:id`           | owner or admin  | partial update (capacity guarded); admin edits are audited (`EDIT_EVENT`)                                                          |
| POST   | `/events/:id/publish`   | owner or admin  | `DRAFT` → `PUBLISHED`; refused once the listing end has passed, or without a map pin for in-person/hybrid (admin: `PUBLISH_EVENT`) |
| POST   | `/events/:id/unpublish` | owner or admin  | `PUBLISHED` → `DRAFT` while nobody holds a place, else `409 EVENT_HAS_REGISTRATIONS` (admin: `UNPUBLISH_EVENT`)                    |
| POST   | `/events/:id/cancel`    | owner organizer | `DRAFT`/`PUBLISHED` → `CANCELED`                                                                                                   |

Create/update body:

```json
{
    "title": "React Chennai Meetup",
    "description": "Talks and demos",
    "eventType": "HYBRID",
    "category": "MEETUP",
    "slug": "react-chennai-meetup",
    "startsAtLocal": "2030-09-03T18:00",
    "timeZone": "Asia/Kolkata",
    "venue": "Tidel Park, Chennai",
    "cityId": "chennai",
    "venueLocation": { "latitude": 12.9894, "longitude": 80.2486 },
    "priceMinor": 39900,
    "onlineUrl": "https://meet.example.com/react",
    "capacity": 50,
    "socialLinks": [
        { "platform": "LINKEDIN", "url": "https://www.linkedin.com/company/x" }
    ],
    "imageIds": ["<upload id>", "<upload id>"],
    "slots": [],
    "publish": false
}
```

- `eventType`: `IN_PERSON` (default) \| `ONLINE` \| `HYBRID`. `venue` is
  required unless `ONLINE`; `onlineUrl` (https) is required unless
  `IN_PERSON`.
- `category` (required): `WORKSHOP` \| `MUSIC_SHOW` \| `COMEDY_SHOW` \|
  `PERFORMANCE` \| `KIDS` \| `CONFERENCE` \| `MEETUP` \| `EXHIBITION` \|
  `SCREENING` \| `PARTY` \| `NETWORKING` \| `HACKATHON` \| `WEBINAR` \| `OTHER`.
- `cityId`: required unless `ONLINE` (ignored and cleared for online events);
  must be an id from `GET /cities` (`400` `fields.cityId`).
- `venueLocation` (create/update, optional, nullable): the venue's map pin,
  `{ latitude, longitude }` in degrees. Optional for drafts; **required to
  publish** an in-person or hybrid event: `publish: true` on create and
  `POST /events/:id/publish` answer `400` with
  `fields.venueLocation = "Pin the venue on the map before publishing."`.
  A published event can't drop its pin (`null`, or a type change that
  leaves it without one). Ignored and cleared for online events. Returned
  to everyone as `venueLocation` (null when not set).
- `priceMinor`: ticket price in paise, `0` (free, the default) to
  `10000000` (₹1,00,000). Shown to attendees; there is no payment step.
- `slug`: optional; generated from the title when left out. Lowercase letters,
  numbers and hyphens, 3–80 characters, unique (`409 SLUG_TAKEN`).
- `socialLinks`: up to one per platform (`WEBSITE`, `X`, `LINKEDIN`,
  `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`); https only, and platform links must
  point at that platform.
- `imageIds`: up to 6 ids from `POST /uploads/images`, in display order (the
  first is the cover). They must be the organizer's own uploads.
- `slots`: optional, up to 10 `{ label, startsAtLocal, endsAtLocal, capacity }`
  in the event's time zone. With slots, leave out `startsAtLocal` and
  `capacity`: the event starts with the earliest slot and its capacity is the
  total. On `PATCH`, `slots` replaces all slots (`[]` turns the event back
  into one session, which then needs `startsAtLocal`, `timeZone` and
  `capacity`); slots can't change once anyone has registered
  (`409 SLOTS_LOCKED`).

Event DTO adds `id`, `organizerId`, `organizerName`, `startsAt` (UTC ISO),
`registeredCount`, `availablePlaces`, `status`, `city` (`{ id, name }` or
`null`), `price` (`{ amountMinor, currency: "INR" }`), `distanceKm` (from the
discovery city, else `null`), `images` (`{ id, url }[]`),
`slots` (with `startsAt`, `endsAt`, local times, `registeredCount`,
`availablePlaces`, `hasStarted`), `hasStarted`, `isRegistrationOpen`,
`createdAt`, `updatedAt`. `onlineUrl` is `null` except for the owner and
attendees holding a place.

### Start times in the past

- A **draft** may have a start time in the past: it is private, and the
  organizer can keep editing it (for example to fix the date).
- **Publishing** needs a future start: `POST /events` with `publish: true`,
  or `POST /events/:id/publish` on a past draft, returns `400` with
  `fields.startsAtLocal` (or `fields.slots`).
- A **published** event can't be moved into the past (`400` on
  `startsAtLocal` / `slots.N.startsAtLocal`), and once it has started it is
  read-only (`409 EVENT_NOT_EDITABLE`).

### Scheduling and listing expiry

- `publishAtLocal` (create/update, optional, nullable): go-live time in the
  event's time zone. A published event stays hidden (phase `SCHEDULED`,
  `404` for visitors) until then, and goes live by the clock: no job runs.
  Must be in the future and before the start. Can't be set once the event
  is live (`400` on `publishAtLocal`): unpublish first.
- `expiresAtLocal` (optional, nullable): the listing ends then: the event
  leaves Discover and registration closes (`409 EVENT_NOT_OPEN`, phase
  `EXPIRED`). Must be in the future, no later than the start and after the
  go-live time. `null` = listed until it starts. Setting a later time on an
  expired event lists it again.
- Every event DTO has `phase`: `DRAFT` \| `SCHEDULED` \| `LIVE` \| `EXPIRED` \|
  `ENDED` \| `CANCELED`. `publishAt`/`publishAtLocal` and
  `expiresAt`/`expiresAtLocal` are only sent to the event's organizer and to
  admins (also in `GET /events` when they are signed in); `null` for
  everyone else.
- _Live_ = `PUBLISHED`, past its go-live time, not expired and not started.
  Discovery, city counts, admin stats and the registration guard all use
  this one rule.

### Discovery query (`GET /events`)

All parameters are optional; unknown values are rejected with field errors.

| Param                             | Values                                                                               | Default   |
| --------------------------------- | ------------------------------------------------------------------------------------ | --------- |
| `q`                               | keyword (≤100 chars) matched against title, venue and host name; `%`/`_` are literal | —         |
| `categories`                      | comma-separated categories, any of them (`WORKSHOP,MUSIC_SHOW`)                      | any       |
| `eventTypes`                      | comma-separated formats (`IN_PERSON,HYBRID`)                                         | any       |
| `startsAfter`                     | ISO date-time with offset                                                            | —         |
| `startsBefore`                    | ISO date-time with offset (must be after `startsAfter`)                              | —         |
| `minPriceMinor` / `maxPriceMinor` | inclusive price range in paise (`maxPriceMinor=0` = free only)                       | —         |
| `city`                            | city id; in-person and hybrid events in that city                                    | —         |
| `radiusKm`                        | 0–1000; with `city`, also cities within this distance (city-to-city)                 | 0         |
| `includeOnline`                   | `true`/`false`: also list online and hybrid events from anywhere                     | `true`    |
| `sort`                            | `soonest` `most-available` `newest` `nearest` (needs `city`)                         | `soonest` |
| `limit`                           | 1–50                                                                                 | 12        |
| `offset`                          | 0–10000                                                                              | 0         |

`GET /events/facets` takes the same filters (without `sort`, `limit` and
`offset`).

The web app turns "Today / Tomorrow / This weekend / This week / This
month" into `startsAfter`/`startsBefore` in the visitor's own time zone, and
its price chips into paise ranges. Its own URLs are readable versions of
these parameters, e.g.
`/discover/events-chennai?categories=workshops|music-shows&date=this-weekend`.

## Uploads

| Method | Path              | Access    | Description                                                            |
| ------ | ----------------- | --------- | ---------------------------------------------------------------------- |
| POST   | `/uploads/images` | organizer | raw image bytes as the body → 201 `{ id, url }` (JPG/PNG/WebP, ≤ 5 MB) |

The file type is detected from the bytes, not the `Content-Type` header.
Files are served from `GET /uploads/<random name>` (outside `/api`).

## Organizer dashboard

Owner/admin event responses also carry `lastEditedBy: { id, name } | null`
(who saved the event last; from `events.updated_by`).

| Method | Path                              | Access          | Description                                                     |
| ------ | --------------------------------- | --------------- | --------------------------------------------------------------- |
| GET    | `/organizer/events`               | organizer       | the organizer's own events + stats                              |
| GET    | `/organizer/events/:id/attendees` | owner organizer | `{ event, attendees[] }` (name, email, registeredAt, slotLabel) |

## Registrations

| Method | Path                        | Access         | Description                                                                                                 |
| ------ | --------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| POST   | `/events/:id/registrations` | attendee       | register → 201 with registration (incl. `slot`) + updated event; body `{ slotId }` when the event has slots |
| POST   | `/registrations/:id/cancel` | owner attendee | cancel, releases one place                                                                                  |
| GET    | `/me/registrations`         | attendee       | upcoming registrations (latest per event)                                                                   |

## Admin

Every route requires an **active admin** (`authenticate` + `authorize('ADMIN')`).
Each change runs in one transaction with its audit-log entry. Admins can't act
on themselves or other admins (those are managed with `npm run admin:create`).

| Method | Path                          | Description                                                                                                 |
| ------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| GET    | `/admin/stats`                | users by role, pending organizers, suspended users, events by status, upcoming events, active registrations |
| GET    | `/admin/users`                | `?role&status&search&limit(≤100)&offset` → `{ items, total, limit, offset }` (no password hashes)           |
| POST   | `/admin/users/:id/approve`    | `PENDING_APPROVAL` organizer → `ACTIVE`                                                                     |
| POST   | `/admin/users/:id/suspend`    | `{ reason }`; existing sessions stop working on the next request                                            |
| POST   | `/admin/users/:id/reactivate` | `SUSPENDED` → `ACTIVE`                                                                                      |
| PATCH  | `/admin/users/:id/role`       | `{ role: ORGANIZER \| ATTENDEE }`; refused if it would strand events or registrations                       |
| GET    | `/admin/events`               | every event incl. drafts, `?status`                                                                         |
| POST   | `/admin/events/:id/cancel`    | `{ reason }`; the reason is shown to attendees as `cancellationReason`                                      |
| GET    | `/admin/audit-log`            | `?limit(≤200)`, newest first                                                                                |

## Error codes

| HTTP | Code                            | When                                                               |
| ---- | ------------------------------- | ------------------------------------------------------------------ |
| 400  | `VALIDATION_FAILED`             | body/params invalid (`details.fields`)                             |
| 401  | `UNAUTHENTICATED`               | no/invalid session                                                 |
| 401  | `INVALID_CREDENTIALS`           | wrong email or password                                            |
| 403  | `FORBIDDEN`                     | wrong role for this route                                          |
| 403  | `ACCOUNT_PENDING_APPROVAL`      | organizer not yet approved by an admin                             |
| 403  | `ACCOUNT_SUSPENDED`             | sign-in to a suspended account (correct password)                  |
| 404  | `EVENT_NOT_FOUND`               | missing event, someone else's event, or a draft you don't own      |
| 404  | `REGISTRATION_NOT_FOUND`        | missing registration, or someone else's                            |
| 404  | `USER_NOT_FOUND`                | admin action on an unknown user                                    |
| 409  | `INVALID_USER_TRANSITION`       | e.g. approving an active user, acting on yourself or another admin |
| 409  | `USER_HAS_ACTIVE_EVENTS`        | demoting an organizer who has upcoming events                      |
| 409  | `USER_HAS_ACTIVE_REGISTRATIONS` | promoting an attendee who has active registrations                 |
| 409  | `EMAIL_TAKEN`                   | signup with an existing email                                      |
| 409  | `ALREADY_REGISTERED`            | second active registration                                         |
| 409  | `EVENT_FULL`                    | no places left                                                     |
| 409  | `EVENT_CANCELED`                | registering for a canceled event                                   |
| 409  | `EVENT_STARTED`                 | registering/canceling after the start                              |
| 409  | `EVENT_NOT_EDITABLE`            | editing a canceled or started event                                |
| 409  | `CAPACITY_BELOW_REGISTRATIONS`  | capacity lower than active registrations                           |
| 409  | `INVALID_STATUS_TRANSITION`     | e.g. publishing a canceled event                                   |
| 409  | `EVENT_HAS_REGISTRATIONS`       | unpublishing an event people have registered for                   |
| 409  | `REGISTRATION_NOT_ACTIVE`       | canceling twice                                                    |
| 400  | `SLOT_REQUIRED`                 | registering for a slotted event without a slot                     |
| 404  | `SLOT_NOT_FOUND`                | slot missing or from another event                                 |
| 409  | `SLOT_FULL`                     | chosen time slot has no seats left                                 |
| 409  | `SLOT_STARTED`                  | chosen time slot has started                                       |
| 409  | `SLOTS_LOCKED`                  | changing slots after people registered                             |
| 409  | `SLUG_TAKEN`                    | event URL already used                                             |
| 413  | `FILE_TOO_LARGE`                | image over `MAX_UPLOAD_MB`                                         |
| 415  | `UNSUPPORTED_IMAGE`             | not a JPG, PNG or WebP image                                       |
| 429  | `RATE_LIMITED`                  | too many sign-in/sign-up attempts; see `Retry-After`               |
| 503  | `SERVICE_UNAVAILABLE`           | `/api/health` when the database is down                            |
| 500  | `INTERNAL_ERROR`                | unexpected; body has `requestId`, details in logs                  |
