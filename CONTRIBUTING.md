# Contributing

Start with [README.md](./README.md) for setup and
[CODING_STANDARDS.md](./CODING_STANDARDS.md) for the rules. This page is the
day-to-day workflow.

## Before you push

```bash
npm run lint        # oxlint (correctness, hooks, a11y, imports, file size)
npm run typecheck   # tsc --noEmit for api and web
npm test            # API integration tests (real Postgres) + web unit tests
npm run test-oxfmt  # formatting check (npm run oxfmt to fix)
```

The pre-commit hook runs oxlint and oxfmt on staged files. Don't bypass it
and don't disable lint rules to get green; fix the code.

## Adding an API endpoint

1. **Schema**: add a zod schema to the module's `schemas` (body, params or
   query). Write user-facing messages for every rule.
2. **Repository**: parameterised SQL only, returns typed rows. Never throws
   HTTP errors.
3. **Service**: business rules and ownership checks; throw `AppError` with a
   stable code from `errors/app-error.ts` (add the code there and to
   `docs/api.md`). Use `withTransaction` for multi-statement writes; guard
   capacity with a conditional `UPDATE`, never read-then-write.
4. **Controller**: read the validated request, call the service, respond
   with `{ data }`.
5. **Route**: `authenticate` → `authorize(role)` → `validate(...)` →
   controller.
6. **Test**: an integration test in `apps/api/test/` covering success, each
   error code and, for writes, the authorization rule.

Read `skills/event-registration-integrity/SKILL.md` before touching
registrations, capacity or event status.

## Adding a UI component

- `shared/ui/` for building blocks used by several features; a feature's
  `components/` for UI that belongs to it. Components never call the API;
  pages wire hooks to components.
- One folder per component: `Component.tsx`, `styles.ts`, `index.ts`,
  `Component.stories.tsx`, `Component.mdx`, and `Component.spec.tsx` when it
  has behaviour.
- Large components: move state into a `use-<name>.ts` hook and split the
  markup into `sections/` (see `features/organizer/components/event-form/`).

## Error handling checklist

- Expected failures → `AppError` (4xx) with a field path in
  `details.fields` when the user can fix it in a form.
- Unexpected failures → let them propagate; the error handler logs them with
  the request id and returns a safe 500.
- Never log passwords, tokens or full request bodies.

## Security checklist for a change

- [ ] New input is validated with zod at the route.
- [ ] Ownership/role is checked in the service, not just hidden in the UI.
- [ ] No user input is concatenated into SQL.
- [ ] No new secret is committed; new env vars are in `config.ts`,
      `.env.example` and the README table.
- [ ] Error messages don't reveal whether another user's data exists.

## Commits and pull requests

Follow `skills/pr-guidelines/SKILL.md`: small, focused commits with
Conventional Commit messages (`feat(api): …`, `fix(web): …`).
