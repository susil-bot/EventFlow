# Submission notes

The reviewer-facing part of the take-home: scope, what is done and not done,
assumptions, security, the AI usage statement and the demo script. Setup and
day-to-day development are in the [README](../README.md); the design and its
trade-offs are in [design-decisions.md](./design-decisions.md).

## Design language

Editorial typography, applied app-wide through design tokens
(`apps/web/src/shared/styles/tokens.ts` and `typography.ts`):

- **Headings**: Libre Caslon Display (serif). **Text, labels, buttons**: Jost
  (geometric sans). Both are open-source stand-ins for the licensed
  Futura PT / editorial-serif pairing used on sites like House & Garden, and
  are self-hosted via `@fontsource` (no third-party font requests). To use
  licensed fonts instead, change `Design.Font.*` and the imports in
  `main.tsx`.
- Uppercase, letter-spaced labels; square, outlined inputs and dropdowns with
  a chevron; uppercase buttons.

Navigation is a two-row **top header** (brand, search, city, account; then
links for the signed-in role), which folds into a menu on phones.

**Discover** lives at `/discover/events-<city>` (or `/discover/events` for
every city), with readable filters in the query string:

```
/discover/events-chennai?categories=workshops|music-shows&date=this-weekend&price=under-500
```

- A left **Filters** panel with collapsible sections, each with its own
  Clear: Categories (with event counts), Date (today, tomorrow, this weekend,
  this week, this month), Format, Price (free, under ₹500, ₹500–2,000, above
  ₹2,000) and Location (distance from the city, include online events).
  Every click applies straight away; there is no Search button.
- Quick category chips above the results, an "Events in Chennai" heading,
  sort (soonest, most places left, recently added, nearest first) and
  poster cards with a date strip and the ticket price.
- On phones the panel opens as a drawer from a "Filters (n)" button.
- All filtering happens in the API. Lists are written in a fixed order, so
  the same filters always give the same URL. Old `/?category=…` links
  redirect to the new URL.
- The city comes from the path. Choosing a city (header button, or the
  first-visit picker) moves to that city's page and remembers the choice.

## Roles and access

| Role          | Gets                                                                                                                                                                  | How they get it              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **Attendee**  | browse, register, cancel own registrations                                                                                                                            | sign-up (active at once)     |
| **Organizer** | create and manage **own** events, see own attendees                                                                                                                   | sign-up, then admin approval |
| **Admin**     | approve organizers, suspend/reactivate users, switch organizer ↔ attendee, see, edit, publish/unpublish and cancel any event (all audited), platform stats, audit log | `npm run admin:create` only  |

Every request goes through three checks in the API: **authenticate** (valid
session cookie, and the user still exists and isn't suspended — looked up
fresh each request), **authorize** (role, and an active account), and
**ownership** in the service layer. Someone else's event or registration
answers `404`, exactly like a missing one. The React route guards only shape
the UI. See [docs/design-decisions.md](./design-decisions.md#4-authorization-lives-in-the-backend).

## Security

| Concern       | How it is handled                                                                                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Passwords     | bcrypt hashes; login compares against a dummy hash for unknown emails so timing doesn't reveal accounts                                                                                                                                     |
| Sessions      | HS256 JWT pinned to one algorithm, in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production; `COOKIE_SECURE` overrides it for the local HTTP Docker demo)                                                                            |
| Brute force   | Per-IP rate limit on `/auth/login` and `/auth/signup` → `429 RATE_LIMITED` with `Retry-After`                                                                                                                                               |
| Authorization | Roles and ownership checked in the backend on every request; UI guards are UX only                                                                                                                                                          |
| Input         | Every body, param and query validated with zod at the route boundary; SQL is always parameterised                                                                                                                                           |
| Uploads       | Organizer-only; content-type allow-list; real type sniffed from the bytes; size cap; re-encoded (metadata such as GPS removed, hidden data dropped, huge dimensions refused); random file names; served with `nosniff` and a sandboxing CSP |
| Errors        | One error handler; unknown errors return a generic 500 with a request id, never SQL or stack traces                                                                                                                                         |
| Logs          | Cookies, auth headers and passwords are redacted; every line carries the request id                                                                                                                                                         |
| Headers       | Helmet defaults, `x-powered-by` off, CORS limited to `CLIENT_ORIGIN`                                                                                                                                                                        |
| Config        | Validated at boot; production refuses the example `JWT_SECRET`                                                                                                                                                                              |
| Containers    | Non-root API and nginx images; production-only dependencies; no secrets in images or the repo (JWT secret generated at first start); nginx sends a strict CSP, `nosniff`, `X-Frame-Options`                                                 |
| Third parties | Map tiles and address search use OpenStreetMap (no key, no account); only the typed venue address is sent, and only when the organizer presses Find                                                                                         |

Report a vulnerability privately to the maintainer rather than opening a
public issue.

## Assumptions

- Seeded accounts plus a simple email/password sign-up are acceptable for
  the exercise. Attendees are active at once; **organizers start "awaiting
  approval"** and need an admin before they can create events. Admins can't
  sign up; they are created with `npm run admin:create`.
- **Data minimisation**: we collect only name, email and password. Age,
  sex/gender and similar personal data are not collected because no feature
  needs them; adding them later (e.g. age-restricted events) would store a
  date of birth, keep it optional and never show it to organizers.
- Events have a start time but no end time (none was required); "upcoming"
  means "has not started".
- Canceling an event keeps registrations so attendees see the event as
  canceled; nothing new can register.
- Attendees cannot cancel once the event has started; organizers cannot
  register for events.
- Canceled events are terminal. A published event can go back to draft
  (unpublish) only while nobody is registered; otherwise it is canceled.
- **Admin moderation goes beyond the brief**: the brief limits editing and
  canceling to the event's organizer, which holds for every organizer and
  attendee; the platform admin can also edit, publish/unpublish and cancel
  any event, and every such action is audited. See
  [design decisions §12](./design-decisions.md#12-admin-moderation-beyond-the-brief)
  for why, and how to switch it off.
- **Time slots**: an attendee holds one slot per event. With slots, the
  event's capacity is the total of the slot seats and it starts with the
  earliest slot, so registration for every slot closes when the first slot
  starts. Slots can only be changed while nobody is registered.
- **Online events** don't need a venue (stored as "Online"); the meeting link
  is only sent to the organizer and to attendees holding a place.
- **Images** are re-encoded on upload and stored on the API server's disk
  (`UPLOAD_DIR`) under random names, instead of S3, so the project runs with
  no cloud account or credentials. Storage sits behind an `ImageStore`
  interface, so S3 is a new implementation, not a rewrite (see
  [design decisions §16](./design-decisions.md#16-image-uploads-and-storage)).
  Images uploaded but never attached to an event are not cleaned up yet.
- Event URLs (slugs) are generated from the title when left blank; they can be
  changed later, which breaks old links (no redirects).

## What's done

- Everything in the PRD's acceptance criteria: auth with roles; create, save
  as draft, publish, edit and cancel with ownership checks; public discovery
  with loading/error/empty states and search; event details with time zone,
  capacity and remaining places; register/cancel with duplicate, full,
  canceled and started checks and concurrency safety; organizer dashboard
  with stats, a CMS-style event list (status badge, "Updated 3 hours ago by
  …", per-row menu) and attendee lists; attendee dashboard with canceled
  registrations shown separately.
- Event editor laid out like a CMS article editor: header with "Last
  modified … by …", status chip and links; a sticky action bar (menu,
  Preview, Save — disabled until something changes, Publish…/Schedule…,
  Close with an unsaved-changes check). Publishing goes through a dialog
  (go live now or at a chosen time, shows the time zone and the event URL).
  Unpublish and cancel live in the editor's "···" menu behind a confirm
  dialog; cancelling an event with registrations also needs a tick-box
  acknowledgement. The list no longer has one-click publish or cancel.
- Venue map: in-person and hybrid events get a map pin (address search,
  then drag the pin), required to publish; the event page shows an
  OpenStreetMap map and a "Get directions" link. No API key: tiles and
  address search come from OpenStreetMap (Leaflet + Nominatim), and only the
  typed address is sent to Nominatim, on an explicit search.
- Event type (in person / online / hybrid), category, custom event URL
  (slug), meeting link, social links, promo image uploads (first image is the
  cover) and optional time slots with their own seats.
- Unsaved work is protected: leaving the editor by any route (Close, a link,
  the browser's Back button, closing the tab) asks first. "← Back" links
  return to the page you came from (e.g. attendee list → editor).
- **Docker**: `docker compose up --build` runs Postgres, the API and the
  nginx-served web app with health-checked start-up, demo data and no
  secrets in the repo; CI builds it and runs end-to-end smoke checks.
- Automated tests for every business rule, including concurrency (event and
  slot level).
- Storybook stories and MDX docs for every component; CI workflow.

## Not done / would improve with more time

- **Auth hardening**: refresh tokens or server sessions for instant
  revocation, CSRF tokens for cross-site deployments, a shared (Redis)
  rate-limit store for multi-instance deployments, email verification and
  password reset.
- **Waitlist** for full events with auto-promotion on cancellation.
- **Notifications**: email attendees when an event is canceled or changed.
- Event end time for single-session events, rich-text descriptions.
- Production maps: the public OpenStreetMap tile and Nominatim servers are
  fine for a demo but have usage limits; production would use a commercial
  or self-hosted tile/geocoding provider (`VITE_MAP_TILE_URL`,
  `VITE_GEOCODER_URL`) and use the venue pin for "nearest" sorting.
- An S3 `ImageStore` behind a CDN, thumbnails in several sizes, and cleanup
  of unattached uploads; slug redirects after a URL change.
- Playwright end-to-end tests in CI (the main flows were verified with a
  scripted headless-browser walkthrough during development) and visual
  regression on Storybook.
- Observability: metrics and a structured audit log of status changes
  (request IDs are in place).
- HTTPS in the Docker setup (e.g. a Caddy front proxy with automatic
  certificates) and image publishing to a registry for a hosted demo.
- Autosaving a local draft of the event form, so even a browser crash loses
  nothing.

## AI usage

I used Claude (Anthropic) as a pair-programmer:

- Generating the first draft of the scaffolding, components, stories and docs
  following the standards in `AGENTS.md`/`CODING_STANDARDS.md` — the same
  conventions and agent rules I use in my day-to-day codebase.
- Proposing the concurrency strategy, which I reviewed against PostgreSQL's
  documented row-locking behaviour and verified with the race-condition tests
  and `verify:concurrency`.
- Running tests, lint and a headless-browser walkthrough; it surfaced two
  real bugs (submit intent read before React state updated; legacy time-zone
  alias missing from the picker) that are now fixed and covered by tests.

All code was reviewed, run and tested locally; no real credentials or
confidential data were shared with AI tools.

## Demo walkthrough (for the video)

1. **Discover** signed out → cards show availability; open "Last Seat
   Workshop" → registration card asks you to sign in.
2. **Attendee demo** → Register now takes the last place; toast +
   updated meter; **My registrations** shows it with a cancel action.
3. Sign in as `attendee3@example.com` → the workshop shows "Sold out" /
   "This event is full".
4. **Organizer demo** → dashboard stats and event list (Pottery Wheel
   Basics shows a scheduled badge); **Create event** → submit empty to show
   validation, fill in, **Save**, then **Publish…** → choose Now or a time; **Attendees** on the
   workshop shows names, emails and times; **Edit** → set capacity to 1 →
   blocked ("Must be at least 2").
5. Terminal: `npm test` (concurrency tests) and `npm run verify:concurrency`.
6. Show an ownership check: `organizer2@example.com` calling
   `GET /api/organizer/events/<workshop-id>/attendees` returns
   `404 EVENT_NOT_FOUND` (someone else's event looks exactly like a missing
   one).
7. Optional: `docker compose up --build`, then `npm run docker:smoke`.
