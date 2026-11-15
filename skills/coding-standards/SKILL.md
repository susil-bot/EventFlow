---
name: coding-standards
description: Apply shared coding standards for TypeScript, React and Node.js in this repository. Use when creating, reviewing, or refactoring any code.
license: MIT
metadata:
    author: event-management-app
    version: '1.0'
---

# Coding Standards

## General

- Source is TypeScript with `strict: true`. No `any`; use `unknown` and narrow.
- Formatting is `oxfmt`; linting is `oxlint`. Never hand-format or disable
  rules to pass.
- Prefer small pure functions; no nested ternaries; no parameter reassignment.
- Prefer destructuring when reading properties.

## TypeScript

- Use the `type` keyword when importing types.
- Export the props/DTO type next to the thing it describes.
- Derive request types from zod schemas with `z.infer`.

## Naming and File Organization

- React components: `PascalCase.tsx`, one component folder each.
- Other modules: `kebab-case.ts`.
- Tests: colocated `*.spec.ts(x)`; API integration tests in `apps/api/test/`.
- Stories: `*.stories.tsx`; docs: `*.mdx`, colocated with the component.

## Dependencies

- Add a dependency only when it removes meaningful code or risk. Record why in
  `docs/design-decisions.md` when it is architectural.

## Configuration and Environment

- Read environment variables only in `apps/api/src/config.ts` (API) and
  `apps/web/src/config.ts` (web). Document new variables in `.env.example`.

## Logging

- Use the API `logger`; never `console.log` in application code.
- Never log passwords, tokens or full request bodies.

See `CODING_STANDARDS.md` for rationale and examples.
