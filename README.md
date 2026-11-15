# EventFlow

Event management app. Organizers create and publish events; attendees find
them, register and cancel. React + Vite front end, Express API, PostgreSQL.

Capacity and "one active registration per attendee" are enforced by
PostgreSQL itself, so they hold when requests race
([design decisions §1](./docs/design-decisions.md#1-capacity-under-concurrency)).

**Reviewers:** scope, what's done and not done, assumptions and the AI usage
statement are in [docs/submission-notes.md](./docs/submission-notes.md).

## Contents

- [Requirements](#requirements)
- [Run with Docker](#run-with-docker)
- [Run locally](#run-locally)
- [Seeded accounts](#seeded-accounts)
- [Commands](#commands)
- [Project layout](#project-layout)
- [Making changes](#making-changes)
- [Configuration](#configuration)
- [Tests](#tests)
- [Debugging and logs](#debugging-and-logs)
- [Troubleshooting](#troubleshooting)
- [Docs](#docs)

## Requirements

| Tool                                   | Version                          | Needed for                                     |
| -------------------------------------- | -------------------------------- | ---------------------------------------------- |
| Docker Desktop, or Engine + Compose v2 | recent                           | the Docker run, or just Postgres for local dev |
| Node.js                                | 22 (`.nvmrc`); 20.19+ also works | local development and tests                    |
| npm                                    | 10+                              | local development and tests                    |

## Run with Docker

Runs the whole app with no local Node setup.

```bash
docker compose up --build
```

Open http://localhost:8080 and sign in with a [seeded account](#seeded-accounts).
The first build takes a few minutes; later starts take seconds.

| Service    | Address                       | What it does                                                                |
| ---------- | ----------------------------- | --------------------------------------------------------------------------- |
| `web`      | http://localhost:8080         | nginx: serves the built React app, proxies `/api` and `/uploads` to the API |
| `api`      | port 4000, inside the network | migrates the database on start, loads demo data into an empty database      |
| `postgres` | `localhost:5432`              | PostgreSQL 16; data in the `postgres-data` volume                           |

Each service starts only after the previous one is healthy.

The `npm run docker:*` shortcuts below need Node installed; without it, use
the `docker compose` command shown in each comment.

```bash
npm run docker:up      # docker compose up --build --detach --wait
npm run docker:smoke   # bash scripts/docker-smoke.sh (end-to-end checks)
npm run docker:logs    # docker compose logs --follow api web
npm run docker:down    # docker compose down (keeps data)
npm run docker:reset   # docker compose down --volumes (deletes data)

docker compose exec api node dist/db/seed.js     # reload demo data (replaces everything)
docker compose exec api node dist/scripts/create-admin.js --email you@example.com --name "Your Name"
docker compose exec postgres psql -U postgres events_dev
```

Optional settings, from your shell or a root `.env` file:

| Variable         | Default       | Use it to                                                                                                     |
| ---------------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| `WEB_PORT`       | `8080`        | serve the app on another port                                                                                 |
| `POSTGRES_PORT`  | `5432`        | publish Postgres on another host port (if a local Postgres already uses 5432)                                 |
| `JWT_SECRET`     | _(generated)_ | set your own; otherwise one is generated on first start and kept in a volume                                  |
| `SEED_DEMO_DATA` | `true`        | skip the demo data with `false`                                                                               |
| `COOKIE_SECURE`  | `false`       | set `true` when serving over HTTPS (plain HTTP on localhost needs `false`, Safari drops secure cookies there) |
| `LOG_LEVEL`      | `info`        | `debug` for more detail                                                                                       |

How the images are built: [design decisions §15](./docs/design-decisions.md#15-running-in-docker).

## Run locally

For working on the code: hot reload for both apps, Postgres in Docker (or
your own).

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres (Docker; creates events_dev and events_test on first start)
npm run db:up

# 3. Configure the API, then set JWT_SECRET (any 32+ characters):
cp apps/api/.env.example apps/api/.env
openssl rand -hex 32          # paste the output as JWT_SECRET in apps/api/.env

# 4. Create the schema and load demo data
npm run db:migrate
npm run db:seed

# 5. Start the API (http://localhost:4000) and the web app (http://localhost:5173)
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` and `/uploads` to the API,
so the browser sees one origin, like the Docker setup. Check the API with
`curl http://localhost:4000/api/health`.

`npm run setup:local` does steps 3 to 5 in one go: it writes `.env` with a
random secret, finds or starts Postgres, creates both databases, migrates,
seeds, starts both apps and checks they respond (log in `logs/setup-local.log`).

Using your own Postgres instead of Docker:

```bash
createdb events_dev
createdb events_test
# then point DATABASE_URL and TEST_DATABASE_URL in apps/api/.env at them
```

The Docker setup and `npm run db:up` use the same Postgres container and
`events_dev` database, so data is shared between them.

## Seeded accounts

Every account's password is `Password123!`. The sign-in page has one-click
buttons for the demo organizer, attendee and admin.

| Email                           | Role                         | Good for                                                                             |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| `organizer@example.com`         | Organizer                    | the 2-seat workshop, the time-slot lab, a draft without a map pin, a scheduled event |
| `organizer2@example.com`        | Organizer                    | most other events; try (and fail) to manage `organizer@`'s events                    |
| `pending-organizer@example.com` | Organizer, awaiting approval | signs in, but can't create events until an admin approves                            |
| `attendee@example.com`          | Attendee                     | take the last place in "Last Seat Workshop"                                          |
| `attendee2@example.com`         | Attendee                     | already holds 1 of the workshop's 2 places                                           |
| `attendee3@example.com`         | Attendee                     | sees the workshop as full after `attendee@` registers                                |
| `admin@example.com`             | Admin                        | approve organizers, suspend users, moderate events, audit log                        |

`npm run db:reset` drops the schema, re-runs every migration and re-seeds.
Create another admin with `npm run admin:create -- --email … --name …`
(password from `ADMIN_PASSWORD`, or generated and printed once).

## Commands

Run from the repository root.

| Command                                       | What it does                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                 | API (tsx watch) and web (Vite) with reload                                                                                |
| `npm test`                                    | API tests, then web tests                                                                                                 |
| `npm run test-api` / `npm run test-web`       | one side only                                                                                                             |
| `npm run lint`                                | oxlint                                                                                                                    |
| `npm run oxfmt` / `npm run test-oxfmt`        | format / check formatting                                                                                                 |
| `npm run typecheck`                           | `tsc --noEmit` for both apps                                                                                              |
| `npm run build`                               | production build of both apps                                                                                             |
| `npm run storybook`                           | component library on http://localhost:6006                                                                                |
| `npm run db:up` / `db:down`                   | start Postgres / stop all of this project's containers                                                                    |
| `npm run db:migrate` / `db:seed` / `db:reset` | apply new migrations / load demo data / start the database over                                                           |
| `npm run admin:create -- --email … --name …`  | create an admin account                                                                                                   |
| `npm run verify:concurrency`                  | fire 15 parallel registrations at a 3-place event on the running API (Docker: prefix `API_URL=http://localhost:8080/api`) |
| `npm run docker:*`                            | see [Run with Docker](#run-with-docker)                                                                                   |

## Project layout

```text
apps/
  api/                 Express API (TypeScript)
    src/
      app.ts           middleware order, routes, error handler
      config.ts        environment variables, validated with zod at boot
      db/              pool, migrator, migrations/*.sql, seed data
      middleware/      authenticate, authorize, validate, request id, rate limit, errors
      modules/         one folder per feature: routes → controller → service → repository
        events/  registrations/  auth/  admin/  cities/  uploads/
    test/              Jest + supertest against a real database
  web/                 React app (Vite, TypeScript)
    src/
      app/             routes, layout, providers, route guards
      features/        discover, events, organizer, tickets, admin, auth, location
      shared/          UI components, API client, hooks, styles, test helpers
docker/                nginx config and the API container's entrypoint
docs/                  API reference, data model, design decisions, submission notes
scripts/               local setup, Docker smoke test
```

Where things live:

| Looking for                                 | File                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| The capacity guard (one conditional UPDATE) | `apps/api/src/modules/events/repository/events.ts` → `tryReservePlace`         |
| Registration and cancellation               | `apps/api/src/modules/registrations/service.ts`                                |
| "Is this event open?" (one SQL rule)        | `apps/api/src/modules/events/repository/columns.ts` → `liveCondition`          |
| Ownership checks                            | `apps/api/src/modules/events/service/access.ts`                                |
| Auth and roles                              | `apps/api/src/middleware/authenticate.ts`                                      |
| Error responses and codes                   | `apps/api/src/middleware/error-handler.ts`, `apps/api/src/errors/app-error.ts` |
| Database schema                             | `apps/api/src/db/migrations/`                                                  |
| Front-end routes                            | `apps/web/src/app/App.tsx`                                                     |
| API client and DTO types                    | `apps/web/src/shared/api/`                                                     |
| Design tokens                               | `apps/web/src/shared/styles/tokens.ts`                                         |

## Making changes

**An API endpoint.** Add the zod schema and route in the module's
`routes.ts`, a thin controller, the rule in the service, the SQL in the
repository. Throw `AppError` with an `ErrorCode` for expected failures; the
error handler turns it into `{ error: { code, message, details } }`. Add a
test in `apps/api/test` (helpers in `test/factories.ts`).
[apps/api/src/modules/README.md](./apps/api/src/modules/README.md) describes
the layers.

**A database change.** Add the next file in `apps/api/src/db/migrations/`
(`009_<what>.sql`). Migrations are forward-only and each runs in its own
transaction; `npm run db:migrate` applies new ones. The test suite rebuilds
its schema from the migrations on every run. Update
[docs/data-model.md](./docs/data-model.md).

**A UI component.** One folder per component: `Component.tsx`, `styles.ts`,
`index.ts`, `Component.stories.tsx`, `Component.mdx`, and
`Component.spec.tsx` when it has logic. Shared pieces go in
`shared/ui`, feature pieces in `features/<name>/components`. Rules:
[CODING_STANDARDS.md](./CODING_STANDARDS.md).

**Before you push.** A pre-commit hook runs oxlint and oxfmt on staged
files. CI (`.github/workflows/ci.yml`) runs lint, the formatting check,
typecheck, both test suites and the build, then builds the Docker images and
runs the smoke test. Workflow details: [CONTRIBUTING.md](./CONTRIBUTING.md).

## Configuration

The API reads `apps/api/.env` (template: `apps/api/.env.example`) and
validates it at boot (`apps/api/src/config.ts`): a bad or missing value
stops the API with a message naming it.

`apps/api/.env` (see `apps/api/.env.example`). Config is validated with zod
at boot (`apps/api/src/config.ts`), so the API fails fast on bad values.

| Variable                         | Default                                                   | Description                                                          |
| -------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| `NODE_ENV`                       | `development`                                             | `development` \| `test` \| `production`                              |
| `PORT`                           | `4000`                                                    | API port                                                             |
| `DATABASE_URL`                   | `postgres://postgres:postgres@localhost:5432/events_dev`  | App database                                                         |
| `TEST_DATABASE_URL`              | `postgres://postgres:postgres@localhost:5432/events_test` | **Wiped** by the test suite                                          |
| `JWT_SECRET`                     | — (required, ≥ 32 chars)                                  | Session signing secret                                               |
| `SESSION_TTL_HOURS`              | `12`                                                      | Session lifetime                                                     |
| `CLIENT_ORIGIN`                  | `http://localhost:5173`                                   | CORS origin                                                          |
| `LOG_LEVEL`                      | `info`                                                    | pino log level                                                       |
| `UPLOAD_DIR`                     | `./uploads`                                               | Where promo images are stored on disk                                |
| `MAX_UPLOAD_MB`                  | `5`                                                       | Largest image an organizer can upload                                |
| `AUTH_RATE_LIMIT_MAX`            | `20`                                                      | Sign-in/sign-up requests per IP per window                           |
| `AUTH_RATE_LIMIT_WINDOW_MINUTES` | `15`                                                      | Rate-limit window                                                    |
| `TRUST_PROXY`                    | _(off)_                                                   | Express `trust proxy`; set `1` behind one reverse proxy              |
| `COOKIE_SECURE`                  | `true` in production, else `false`                        | `Secure` session cookie; `false` only for a local HTTP demo (Docker) |

`apps/web/.env` (optional, see `apps/web/.env.example`):

| Variable            | Default                 | Description                                     |
| ------------------- | ----------------------- | ----------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`                  | API base used by the browser                    |
| `API_PROXY_TARGET`  | `http://localhost:4000` | Where Vite proxies `/api` and `/uploads` in dev |
| `VITE_MAP_TILE_URL` | OpenStreetMap tiles     | Map tile URL template (`{z}/{x}/{y}`)           |
| `VITE_GEOCODER_URL` | OpenStreetMap Nominatim | Address search used for the venue pin           |

`.env` files are git-ignored; only the `.env.example` templates are
committed, with no real secrets.

## Tests

```bash
npm run db:up    # the tests need Postgres
npm test
```

- **API** (`apps/api/test`, Jest + supertest): runs against the real
  `events_test` database (`TEST_DATABASE_URL`), whose schema is dropped and
  rebuilt from the migrations at the start of every run. Covers duplicate
  registrations, full, canceled and started events, cancellation, capacity
  edits, ownership, a route-by-role access matrix, scheduling, uploads and
  the race for the last place (30 attendees, 3 places, exactly 3 succeed).
- **Web** (`apps/web`, Vitest + Testing Library): components, forms and
  validation, route guards, the unsaved-changes guard, URL state.
- **Concurrency against the running app:** with `npm run dev` running,
  `npm run verify:concurrency` (tune with `CAPACITY=5 ATTEMPTS=100`).
- **Docker:** `npm run docker:smoke` checks a running stack end to end.

Run one file: `npm run test -w apps/api -- registrations` or
`npm run test -w apps/web -- EventForm`.

## Debugging and logs

- **Request IDs.** Every response has an `X-Request-Id` header, and every
  log line for that request carries the same id. Unexpected errors (500)
  return it in the body, and the web app shows it as "reference: …".
  Validation errors (400) don't show it: the form highlights the fields
  and the message names the problem.
- **Database down.** If Postgres can't be reached, requests answer `503`
  ("EventFlow is temporarily unavailable…") and the log says
  `Database unreachable: is PostgreSQL running and DATABASE_URL correct?`.
  `curl localhost:4000/api/health` confirms it.
  Find the request with `docker compose logs api | grep <id>` (or search the
  `npm run dev` output).
- **Logs.** pino, one line per request (method, URL, status, duration).
  Pretty-printed in development, JSON in Docker. Cookies, auth headers and
  passwords are redacted. `LOG_LEVEL=debug` shows more.
- **Errors.** Expected failures are `AppError`s: a 4xx with a stable
  `code` (`EVENT_FULL`, `VALIDATION_FAILED`, …) and per-field messages in
  `details.fields`, not logged as errors. Anything else is logged with its
  stack and answered with a generic 500.
- **Breakpoints.** `cd apps/api && npx tsx watch --inspect src/server.ts`,
  then attach VS Code or `chrome://inspect`. Web: the browser's DevTools
  (Network tab: status, `error.code`, `X-Request-Id`).
- **Health.** `GET /api/health` checks the API and the database;
  `docker compose ps` shows each container's health.

## Troubleshooting

| Symptom                                                        | Fix                                                                                                   |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| API exits with `Invalid environment configuration: JWT_SECRET` | Set `JWT_SECRET` in `apps/api/.env` to 32+ characters (`openssl rand -hex 32`)                        |
| `ECONNREFUSED 127.0.0.1:5432`                                  | Postgres isn't running: `npm run db:up`, or start your own and check `DATABASE_URL`                   |
| `database "events_test" does not exist`                        | It is only created on a fresh volume: `docker compose exec postgres createdb -U postgres events_test` |
| `port is already allocated` (5432 or 8080)                     | Another service uses it: `POSTGRES_PORT=55432` or `WEB_PORT=8081` before the Docker command           |
| `EADDRINUSE` on 4000 or 5173                                   | A previous `npm run dev` is still running; stop it, or set `PORT` in `apps/api/.env`                  |
| Signed in, then signed out straight away (Docker)              | Keep `COOKIE_SECURE=false` on plain HTTP; set `true` only behind HTTPS                                |
| Maps are grey or the address search fails                      | They need internet access to OpenStreetMap; publishing still works by clicking the map                |
| `Could not load the "sharp" module`                            | Re-run `npm install` on the machine that runs the API (it installs the right binary)                  |
| The UI looks out of date after pulling                         | Hard-refresh the browser (Cmd/Ctrl+Shift+R); in Docker, `npm run docker:up` rebuilds                  |
| Start from a clean slate                                       | `npm run db:reset` (local) or `npm run docker:reset` (Docker)                                         |

## Docs

- [docs/api.md](./docs/api.md): endpoints, payloads and error codes
- [docs/data-model.md](./docs/data-model.md): tables, constraints and indexes
- [docs/design-decisions.md](./docs/design-decisions.md): key decisions and trade-offs
- [docs/submission-notes.md](./docs/submission-notes.md): scope, done and not done, assumptions, security, AI usage, demo script
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) and [CONTRIBUTING.md](./CONTRIBUTING.md): conventions and workflow
