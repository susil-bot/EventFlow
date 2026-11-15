# Design Decisions, Assumptions and Trade-offs

## 1. Capacity under concurrency

**Decision:** a single conditional `UPDATE` reserves a place inside a
transaction, then the registration row is inserted.

```sql
UPDATE events SET registered_count = registered_count + 1
 WHERE id = $1 AND status = 'PUBLISHED'
   AND starts_at > now() AND registered_count < capacity;
```

Why it is safe: in PostgreSQL (READ COMMITTED) concurrent `UPDATE`s of the
same row queue on its row lock. When a waiting transaction gets the lock it
re-evaluates the `WHERE` clause against the newly committed row, so once the
last place is taken every other request updates 0 rows and gets
`EVENT_FULL`. There is no window between "check" and "write".

If the insert then fails (duplicate active registration) the transaction
rolls back and the reserved place is returned automatically.

Alternatives considered:

| Option                             | Why not                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| `SELECT count(*)` then `INSERT`    | race condition — both requests see "1 left"                     |
| `SELECT … FOR UPDATE` on the event | correct, but two round-trips and easier to get wrong later      |
| `SERIALIZABLE` isolation + retries | correct, but needs retry logic and fails noisily under load     |
| Application lock / Redis           | extra infrastructure; breaks with multiple API instances anyway |

Verified by `apps/api/test/registrations.spec.ts` (30 attendees racing for 3
places; 10 parallel requests from one attendee) and by
`npm run verify:concurrency` against a running server.

## 2. Duplicate registrations

A **partial unique index** (`WHERE status = 'ACTIVE'`) is the source of
truth. It survives races the application can't see and still allows
re-registering after a cancellation (history is kept).

## 3. Capacity edits

`UPDATE … SET capacity = $new WHERE … AND registered_count <= $new` — the
check and write are one statement, so a registration landing at the same
moment cannot leave the event over capacity. The `CHECK (registered_count <=
capacity)` constraint is the last line of defence.

## 4. Authorization lives in the backend

- `authenticate` → `authorize(role)` middleware on every protected route.
- Ownership is checked in services against rows loaded from the DB
  (`loadOwnedEvent`, registration `attendee_id`). The attendee list is only
  queried after ownership is verified.
- The React route guard (`RequireRole`) and hidden buttons are UX only.
  `access-control.spec.ts` calls every protected route as anonymous and as
  each role to prove the API alone enforces access.
- **`404` for non-owners.** Someone else's event or registration answers
  exactly like a missing one (`EVENT_NOT_FOUND` / `REGISTRATION_NOT_FOUND`),
  so ids can't be probed to learn what exists. `403` is reserved for "your
  role can't do this" and "your account isn't approved yet".
- **Three roles.** Attendee and organizer come from sign-up; admin only from
  `npm run admin:create`, so no request can create one. Organizers start
  `PENDING_APPROVAL`: they can sign in, but `authorize` refuses organizer
  routes until an admin approves them.
- **Admin actions are guarded and audited.** Each runs in one transaction
  that row-locks the user, refuses to touch the caller or other admins,
  checks the transition (e.g. only pending organizers can be approved; a role
  change can't strand upcoming events or registrations) and writes the audit
  entry. Suspensions and event cancellations require a reason.

## 5. Authentication shortcut

Email + password with bcrypt hashing and a JWT in an `httpOnly`,
`SameSite=Lax` cookie (`Secure` in production). The web app talks to the API
through the Vite proxy, so cookies are same-origin.

**Immediate revocation.** The token only carries the user id. `authenticate`
loads the user's current role and status on every request (one primary-key
lookup), so a suspension, approval or role change applies to the next
request; a suspended or deleted user's cookie is cleared and answered `401`.
This costs one indexed query per authenticated request, which is cheap at
this scale; at higher traffic a short-lived cache keyed by user id (with
invalidation on admin changes) would remove it.

**Not production-grade yet** — what I would add:

- Server-side session records to list and revoke individual devices
  (sign-out is per browser today).
- CSRF token for state-changing requests if the API is served cross-site
  (`SameSite=Lax` covers the same-site setup used here).
- Per-account lockout on repeated failures (per-IP rate limiting is in
  place), email verification, password reset, and a managed secret store for
  `JWT_SECRET`.
- Notifying organizers by email when they are approved or suspended.

## 6. Time zones

Organizers enter wall-clock time + IANA zone; the API converts to a UTC
instant with Luxon and stores both. The UI formats with `Intl` in the
**event's** zone and always prints the zone name, so a viewer in London sees
"6:00 PM GMT+5:30 · Asia/Kolkata" for a Chennai event.

## 7. Status rules (assumptions)

- `DRAFT → PUBLISHED`, `DRAFT/PUBLISHED → CANCELED`. Canceled is terminal.
- `PUBLISHED → DRAFT` (unpublish) only while nobody holds a place; the check
  is part of the same `UPDATE`, so a registration can't slip in between.
  With registrations, the organizer cancels instead, so attendees are never
  left holding a place on a hidden event.
- Canceled and started events cannot be edited.
- Canceling an event keeps registrations as `ACTIVE` so attendees see
  "Event canceled" on their dashboard and organizers keep the attendee list
  for communication. Nothing can register for it. The attendee dashboard
  lists these under "Canceled" (not "Upcoming"), and the organizer table
  shows no available places for a canceled event.
- Attendees cannot cancel after the event has started.
- Organizers cannot register for events (role separation per the PRD).

## 8. Frontend architecture

Mirrors the Verso repository conventions:

- Feature folders: `app/` (routes, layout, providers) → `features/<name>/`
  (components, pages, hooks, utils for discover, events, location,
  organizer, tickets, admin, auth) → `shared/` (UI building blocks, API
  client, styles, test helpers). Dependencies only point that way, and
  cross-module imports use the `@/` alias. Each component has its own
  folder with `Component.tsx`, `styles.ts`, `index.ts`, `.stories.tsx`,
  `.mdx` and tests where there is logic.
- Discover state lives in the URL (`/discover/events-<city>?categories=a|b`),
  read and written only through `features/discover/utils/discover-url.ts`, so
  filtered views can be shared and the back button works.
- styled-components v6 with `withConfig({ displayName })` and transient
  `$props`; CSS-variable design tokens referenced via the `Design` object.
- Data in TanStack Query hooks; mutations update the event cache with the
  server's response and invalidate affected lists, so availability shown is
  always the server's number.
- The visual direction follows the provided references: a two-row top
  header and a Discover page with a left filter panel and poster cards (in
  the spirit of BookMyShow's events listing, in EventFlow's own editorial
  colours and fonts), and a Luma-style event page with date tile, venue row
  and a registration card. The earlier sidebar was replaced because a
  listing site needs the width for filters and results.

## 9. Trade-offs made for scope

- No ORM: plain SQL with `pg` keeps the concurrency logic explicit and easy
  to explain. A forward-only migrator replaces a migration library.
- Offset pagination (12 per page) on Discover and the admin user list;
  keyset pagination by `starts_at` would be the next step at larger volumes.
- Images are stored on local disk (`UPLOAD_DIR`); events without images
  still get a generated cover from the title.
- No email notifications on cancelation.
- React 18 to match Verso; the code avoids patterns removed in React 19.

## 10. Time slots

Slots reuse the capacity guard instead of adding a second mechanism: the event
row keeps the total capacity, so `tryReservePlace` still guards the event,
and each slot row has its own `registered_count <= capacity` guard taken with
the same conditional `UPDATE`. Locks are always taken event row first, then
slot row, so concurrent registrations can't deadlock. A failed slot
reservation rolls back the event reservation too.

Replacing slots is only allowed while `registered_count = 0`, checked in the
same `UPDATE` that rewrites the event's start time and capacity, so a
registration landing at the same moment can't end up pointing at a deleted
slot.

## 11. Scheduling and listing phases

Organizers can publish now or at a set time (`publish_at`) and end the
listing early (`expires_at`). There is **no background job**: a single SQL
condition, `liveCondition()` (published, past go-live, not expired, not
started), is used by discovery, the city counts, admin stats and the
registration guard itself, so they always agree and a scheduled event goes
live on the first request after its time. The API also derives a `phase`
(`DRAFT`, `SCHEDULED`, `LIVE`, `EXPIRED`, `ENDED`, `CANCELED`) for the UI.
Scheduled events answer `404` to everyone but their organizer and admins.

## 12. Admin moderation (beyond the brief)

The brief says only an event's organizer may edit or cancel it, and that
holds for every organizer and attendee. I added a platform **admin** role,
which can also edit, publish/unpublish and cancel any event, the way a
marketplace's trust & safety team would. Every admin action on an event is
written to the audit log (`EDIT_EVENT`, `PUBLISH_EVENT`, `UNPUBLISH_EVENT`,
`CANCEL_EVENT` with a reason), the editor tells the admin their changes are
audited, and admins can't be created through the API. If the exercise must
be read strictly, it is easy to switch off: drop `'ADMIN'` from the three
`authorize('ORGANIZER', 'ADMIN')` event routes (edit, publish, unpublish)
and remove the admin `POST /admin/events/:id/cancel` route.

## 13. Venue map

In-person and hybrid events carry a map pin (`venue_latitude`,
`venue_longitude`). It is optional for drafts and required to publish; the
service checks it, and the publish `UPDATE` itself refuses a pin-less venue
event, so the rule holds even under races. Maps use OpenStreetMap through
Leaflet, with Nominatim for the address search: no API key or account, so
nothing secret is needed to run the project. Only the typed address is
sent, and only when the organizer presses Find (Nominatim's policy forbids
search-as-you-type). Production would use a commercial or self-hosted
provider (the URLs are configurable).

## 14. Unsaved work and Back navigation

- The editor asks before **any** navigation would discard unsaved input:
  links, the browser's Back/Forward buttons and the Close button go through
  React Router's `useBlocker` (`shared/hooks/use-leave-guard.ts`), and closing
  or reloading the tab triggers the browser's own prompt (`beforeunload`).
  `useBlocker` needs a data router, so the app runs on `createBrowserRouter`
  with one splat route around the existing `<Routes>` (React Router's
  documented incremental migration). A successful save lets its own
  navigation through.
- "← Back" links (`shared/ui/back-link`) behave like the browser's Back
  button: they return to the page the user came from (e.g. the attendee list
  back to the editor, the event page back to a filtered Discover list) and
  only fall back to a parent page when the page was opened directly.
- Next step would be autosaving a local draft of the form, so even a
  browser crash loses nothing.

## 15. Running in Docker

`docker compose up --build` runs the whole app on http://localhost:8080:

- **One Dockerfile, two targets.** `api`: Node 22 (`bookworm-slim`), built in
  a separate stage and shipped with production dependencies only, running
  as the unprivileged `node` user. `web`: the Vite build served by
  `nginx-unprivileged`, which also proxies `/api` and `/uploads` to the API,
  so the browser sees one origin and the session cookie works exactly as
  with the Vite dev proxy.
- **Start-up order by health checks**: Postgres (`pg_isready`) → API
  (`/api/health`, which also checks the database) → web.
- **The API container migrates on every start** and, when
  `SEED_DEMO_DATA=true`, seeds only an empty database, so restarts never
  wipe data. `exec` hands PID 1 to Node (with `init: true`), so `docker stop`
  triggers the graceful shutdown.
- **No secrets in the repo.** Without `JWT_SECRET`, the entrypoint generates
  a random one on first start and keeps it in a volume, so sessions survive
  restarts.
- **Plain HTTP on localhost**: `COOKIE_SECURE=false` in compose, because
  Safari drops `Secure` cookies on `http://localhost` (WebKit bugs 231035,
  232088). The API logs a warning when production runs with it off; behind
  HTTPS it must be `true` (the default for `NODE_ENV=production`).
- nginx adds the SPA fallback for deep links, long-lived caching for hashed
  assets, a 6 MB body limit (images are up to 5 MB; nginx's default is 1 MB),
  `X-Forwarded-For` for the API's per-IP rate limit (`TRUST_PROXY=1`) and a
  Content-Security-Policy that allows only the app itself plus the
  OpenStreetMap tile and search hosts.
- CI builds the images and runs `scripts/docker-smoke.sh` against the stack
  (health, deep links, headers, seeded data, sign-in, 401/403/404 checks).

## 16. Image uploads and storage

Organizers upload promo images as raw bytes (`POST /api/uploads/images`).
Every image goes through the same steps before anything is stored:

1. **Who and how big**: organizers only; the declared content type must be
   an image type (this also blocks cross-site form posts); the body is
   capped at `MAX_UPLOAD_MB` while it is read.
2. **What it really is**: the type is detected from the file's first bytes,
   never from the header or a file name.
3. **Sanitised by re-encoding** (`uploads/sanitize.ts`, using sharp):
   metadata is dropped (EXIF, including GPS position and camera serials,
   and XMP) after applying the photo's orientation; anything hidden in the
   file besides the picture is gone because the output is a fresh encode;
   images over 40 megapixels are refused from their header before decoding
   (decompression bombs); large images are scaled to 2400 px on the longest
   side.
4. **Stored under a server-made name** (`<uuid>.<ext>`) through an
   `ImageStore`, and recorded with its owner, so only that organizer can
   attach it to an event.

**Why local disk instead of S3.** The project has to run with one command,
offline, with no cloud account and no real secrets, so the store used here
is `localDiskStore` (a named volume in Docker), served by the API with
`nosniff`, long caching and a sandboxing CSP. Its limit is that it works with
one API instance only.

**Moving to S3** is a new `ImageStore`, chosen in `uploads/storage/index.ts`;
the service doesn't change:

| `ImageStore` | Local disk (now)                | S3 (production)                                                                      |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------ |
| `put`        | write the file, never overwrite | `PutObject` with `ContentType`, `Cache-Control: public, max-age=31536000, immutable` |
| `remove`     | delete the file                 | `DeleteObject`                                                                       |
| `publicUrl`  | `/uploads/<key>` from the API   | `<CDN_URL>/<key>`                                                                    |

The bucket stays private behind CloudFront (origin access control), so
objects are only readable through the CDN, and credentials come from the
server's IAM role, never from keys in a `.env` file. At larger scale the
browser would upload straight to S3 with a presigned POST limited to image
types and size, and the same sanitising would run on the new object (for
example in a function triggered by the upload) before it can be attached to
an event.
