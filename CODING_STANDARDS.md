# Coding Standards Reference

For AI agents, use `AGENTS.md` as the repository entrypoint and load the
matching skill from `skills/`. This document is the detailed human-readable
reference behind those shorter agent-facing instructions.

---

## Table of Contents

1. [Language and Formatting](#1-language-and-formatting)
2. [Repository Layout](#2-repository-layout)
3. [Single Responsibility Principle](#3-single-responsibility-principle)
4. [React Hooks Rules](#4-react-hooks-rules)
5. [Default Props](#5-default-props)
6. [Styled Components v6](#6-styled-components-v6)
7. [Design Tokens](#7-design-tokens)
8. [Component Folder Convention](#8-component-folder-convention)
9. [Data Fetching](#9-data-fetching)
10. [Backend Layering](#10-backend-layering)
11. [Validation and Errors](#11-validation-and-errors)
12. [Authorization](#12-authorization)
13. [Data Integrity](#13-data-integrity)
14. [Configuration](#14-configuration)
15. [Testing](#15-testing)
16. [Git and Pull Requests](#16-git-and-pull-requests)

---

## 1. Language and Formatting

- All application source code is **TypeScript** with `strict` enabled.
  JavaScript is limited to tooling configuration that the tools expect as
  `.js` (e.g. `jest.config.js`). Do not add `.js` application modules: API
  payloads, validation results and React props are exactly where the type
  checker catches bugs.
- Use the `type` keyword when importing types:
  `import type { EventDto } from './types';`
- Formatting is owned by `oxfmt` (`.oxfmtrc.json`): 2 spaces, single quotes,
  no trailing commas, 80 column print width. Do not hand-format.
- Linting is owned by `oxlint` (`.oxlintrc.json`). Notable rules:
  `no-explicit-any`, `no-nested-ternary`, `no-param-reassign`,
  `prefer-destructuring`, `react/exhaustive-deps`.
- File names: React components are `PascalCase.tsx`; everything else is
  `kebab-case.ts`. Folder names are `kebab-case`.

## 2. Repository Layout

```text
apps/
  api/                 Express + PostgreSQL REST API
    src/
      config.ts        typed, validated environment config
      app.ts           express app factory (no listen)
      server.ts        process entrypoint (listen + shutdown)
      db/              pool, transaction helper, migrations, seed
      middleware/      authenticate, authorize, validate, error handler
      errors/          AppError + error codes
      modules/<name>/  routes → controller → service → repository
    test/              integration tests (supertest + real Postgres)
  web/                 React + Vite client
    src/
      app/             routes, SiteLayout, providers, RequireRole (UX-only guard)
      features/<name>/ everything for one feature:
        components/    presentational UI for the feature
        pages/         route containers – compose hooks + components
        hooks/         data hooks (TanStack Query)
        utils/         pure helpers (e.g. discover-url.ts)
      shared/
        ui/            reusable building blocks (Button, Chip, Modal)
        api/           typed fetch client, endpoints, query keys, DTOs
        styles/        design tokens + global styles
        test/          render helper, fixtures, setup

Dependency direction: `app` → `features` → `shared`. `shared` never imports
from `features` or `app`. Imports that cross a module use the `@/` alias
(`@/shared/ui/button`); imports inside a module stay relative.
skills/                agent skills (canonical)
docs/                  data model, API, decisions
```

## 3. Single Responsibility Principle

Each module should have one reason to change.

- **Separate data and presentation**: hooks fetch, components render.
- **Pages are containers**: they call hooks and pass data into presentational
  components. Components never call the API.
- **Backend layers**: controllers translate HTTP ↔ service calls; services own
  business rules; repositories own SQL. A controller never writes SQL; a
  repository never throws HTTP errors.

```tsx
// ✅ GOOD: container composes a data hook and a pure view
const EventsPage = () => {
    const { data, isLoading, error, refetch } = useEvents();
    return (
        <StateView isLoading={isLoading} error={error} onRetry={refetch}>
            <EventList events={data} />
        </StateView>
    );
};
```

> If you describe a component with the word "and", split it.

## 4. React Hooks Rules

**Do NOT add `eslint-disable`/`oxlint-disable` for hook rules.** Include every
dependency; if that causes loops, restructure (move the function inside the
effect, memoise with `useCallback`, or derive state instead of syncing it).

## 5. Default Props

**Do NOT use `defaultProps`.** Use default parameters:

```tsx
const Button = ({ variant = 'primary', ...rest }: ButtonProps) => (
    <StyledButton $variant={variant} {...rest} />
);
```

## 6. Styled Components v6

- Every styled component declares a `displayName` via `withConfig`.
- Styling-only props are **transient** (`$variant`, `$tone`) so they never
  reach the DOM.
- Use `shouldForwardProp` only when wrapping third-party components that
  cannot take transient props.
- Styles live in a colocated `styles.ts`; component files import named styled
  parts from it.

```ts
export const StyledButton = styled.button.withConfig({
    displayName: 'Button'
})<{ $variant: ButtonVariant }>`
    background: var(${Design.Color.Primary});
`;
```

## 7. Design Tokens

Colours, spacing, radii and typography come from CSS custom properties defined
in `apps/web/src/styles/tokens.ts`. Reference them through the `Design`
object, never with raw hex values:

```ts
color: var(${Design.Color.Text});
padding: var(${Design.Space.Md});
```

## 8. Component Folder Convention

Every React component lives in its own folder:

```text
features/discover/components/poster-card/
  PosterCard.tsx          component + exported props type
  PosterCard.stories.tsx  Storybook story covering supported states
  PosterCard.mdx          Storybook docs (usage, behaviour, props)
  PosterCard.spec.tsx     tests (required for logic-bearing components)
  styles.ts              styled parts
  index.ts               public exports only
```

- Every component under `shared/ui/` or a feature's `components/` **must**
  have a colocated `.stories.tsx` and `.mdx`. Pages and router glue are
  containers and are exempt; page-level layout styles live in the page
  folder's `styles.ts`.
- Stories and tests share fixtures from `src/shared/test/fixtures/`.
- `index.ts` re-exports the component and its public types only.
- Import components through their folder
  (`@/features/discover/components/poster-card`), never through deep paths.

## 9. Data Fetching

- Server state uses TanStack Query through hooks in each feature's `hooks/`.
- Endpoint functions live in `src/shared/api/` and return typed DTOs.
- State that belongs in the URL (Discover filters, pages) is read from and
  written to the URL through one codec module, not kept in component state.
- Every list or detail view renders loading, error and empty states via
  `StateView`.
- Mutations invalidate the queries they affect and surface success/error
  through the toast provider using the API's error message.

## 10. Backend Layering

```text
routes.ts       → wires path + middleware (authenticate, authorize, validate)
controller.ts   → reads req, calls service, shapes { data } response
service.ts      → business rules, transactions, throws AppError
repository.ts   → parameterised SQL only, returns typed rows
schemas.ts      → zod request schemas + inferred types
```

- Use parameterised queries (`$1`, `$2`). Never interpolate user input into
  SQL.
- Map snake_case rows to camelCase DTOs in one place (`mappers.ts`).

### When a layer file grows

Keep files under ~300 lines (`max-lines` lint rule). When a layer file
grows past that, turn it into a folder with an `index.ts` that re-exports
the public API, and split by concern — see `modules/events/service/`,
`repository/` and `schemas/`. Callers keep importing `./service`; the files
behind the index can move freely.

## 11. Validation and Errors

- Validate `body`, `params` and `query` with zod via the `validate`
  middleware. Handlers receive already-parsed data.
- Throw `AppError` with a stable `code` (e.g. `EVENT_FULL`) and HTTP status.
- The central error handler is the only place that writes error responses:
  `{ "error": { "code", "message", "details?" } }`.
- Never leak stack traces, SQL or password hashes in responses.
- Every request gets an id (`X-Request-Id`). The error handler logs
  unexpected errors with it and returns it in the 500 body; the web client
  shows it as a short "reference" so a user report maps to a log line.
- Expected business failures are `AppError`s (4xx). Anything else is a bug:
  let it reach the error handler instead of catching and swallowing it.
- Client side, `apiRequest` turns every failure into an `ApiError`
  (`status`, `code`, `fieldErrors`, `requestId`); use `getErrorMessage` and
  `getFieldErrors` instead of reading responses by hand.

## 12. Authorization

- `authenticate` resolves the user from the `httpOnly` session cookie.
- `authorize('ORGANIZER')` enforces role.
- Ownership (organizer owns event, attendee owns registration) is checked in
  the **service** layer, against data loaded from the database.

## 13. Data Integrity

- Capacity is guarded by a conditional, atomic `UPDATE … WHERE
  registered_count < capacity` inside a transaction.
- Duplicate active registrations are prevented by a **partial unique index**
  `(event_id, attendee_id) WHERE status = 'ACTIVE'`.
- `CHECK` constraints back up every invariant the application enforces
  (`capacity > 0`, `0 <= registered_count <= capacity`).
- Multi-statement writes use `withTransaction`.

## 14. Configuration

- All environment access goes through `apps/api/src/config.ts`, which
  validates variables with zod at boot and fails fast.
- `.env.example` documents every variable. Real secrets are never committed.

## 15. Testing

- API: Jest + supertest against a real PostgreSQL test database. Business
  rules (duplicates, capacity, ownership, concurrency) are covered by
  integration tests because they depend on the database.
- Web: Vitest + Testing Library. Test behaviour through roles and labels, not
  implementation details.
- Test files are colocated and named `*.spec.ts(x)`.

## 16. Git and Pull Requests

- Semantic commits with a capability scope:
  `feat(registrations): reject when event is full`.
- Keep commits focused. Follow `.github/PULL_REQUEST_TEMPLATE.md`
  (What / Why / How / Testing).
- Pre-commit runs `lint-staged` (oxlint + oxfmt).
