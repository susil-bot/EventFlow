---
name: testing-standards
description: Conventions for automated tests in apps/api (Jest + supertest + PostgreSQL) and apps/web (Vitest + Testing Library). Use when writing, reviewing or debugging tests.
license: MIT
metadata:
    author: event-management-app
    version: '1.0'
---

# Testing Standards

## API (`apps/api`)

- Integration tests live in `apps/api/test/*.spec.ts` and run against
  `TEST_DATABASE_URL`. `test/setup.ts` migrates once; `resetDatabase()`
  truncates between tests.
- Use the factories in `test/factories.ts` (`createUser`, `createEvent`,
  `loginAs`) instead of hand-written inserts.
- Assert both the HTTP status **and** the stable `error.code`.
- After a write, assert the database state, not only the response
  (e.g. `registered_count`, number of `ACTIVE` rows).
- Required coverage: duplicate registration, full event, canceled/started
  event, cancellation releases a place, capacity below active registrations,
  ownership (other organizer → 403), role checks, simultaneous last-place
  registration.
- Pure helpers get colocated unit tests (`src/**/*.spec.ts`).

## Web (`apps/web`)

- Vitest + `@testing-library/react` + `user-event`.
- Query by role/label/text the user sees. No snapshot-only tests.
- Wrap with `renderWithProviders` from `src/test/render.tsx`.
- Mock the network at the `api/` boundary with `vi.mock`.

## Naming

- `describe('<EventCard />')` for components, `describe('POST
  /api/events/:id/registrations')` for endpoints.
- Test names state behaviour: `it('rejects a second active registration')`.
