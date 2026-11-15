---
name: event-api-standards
description: Enforce Node.js/Express API standards for apps/api — module layering (routes, controller, service, repository), zod validation, AppError and central error handling, authentication and ownership checks, parameterised SQL. Use when adding or changing endpoints, services or queries.
license: MIT
metadata:
    author: event-management-app
    version: '1.0'
---

# API Standards

## Module layout

```text
src/modules/<feature>/
  routes.ts       router + middleware chain
  controller.ts   HTTP in/out only
  service.ts      business rules, transactions, AppError
  repository.ts   SQL only (parameterised), typed rows
  schemas.ts      zod schemas + inferred types
  mappers.ts      row → DTO (snake_case → camelCase)
```

## Request pipeline

`authenticate` → `authorize(role)` → `validate({ body, params, query })` →
controller → service → repository.

## Rules

- Controllers never touch SQL; repositories never throw HTTP errors.
- Every route input is validated by zod. Unknown keys are stripped.
- Services throw `AppError(status, code, message)`. Codes are
  `SCREAMING_SNAKE_CASE` and stable — the client and tests depend on them.
- Success responses are `{ data }`; errors are
  `{ error: { code, message, details? } }` and come only from
  `middleware/error-handler.ts`.
- Ownership checks compare `event.organizerId`/`registration.attendeeId`
  loaded from the DB with `req.user.id`. Return `404` when the resource does
  not exist and `403` when it exists but belongs to someone else.
- Use `withTransaction` for multi-statement writes; pass the `client` down to
  repository functions as the first argument (`db: Queryable`).
- Passwords are hashed with bcrypt; password hashes never leave the
  repository layer.
- Read env only through `config.ts`.

## Status codes

| Situation                          | Status |
| ---------------------------------- | ------ |
| Validation failure                 | 400    |
| Not signed in / bad credentials    | 401    |
| Wrong role / not the owner         | 403    |
| Missing resource                   | 404    |
| Business-rule conflict (full, dup) | 409    |
