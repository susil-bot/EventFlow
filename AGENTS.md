# Event Management App — Agent Guide

This file is the repository-level entrypoint for AI coding agents.

## Canonical Guidance

- `CODING_STANDARDS.md` contains the repository's general coding standards.
- `skills/` contains shared task-specific guidance.
- `.agents/skills` is a compatibility symlink to `skills/` for agent tools that
  scan `.agents/skills`.
- `docs/` explains the data model, API contract and design decisions. Read
  `docs/design-decisions.md` before changing registration or capacity logic.

## Skill Loading

- Read `skills/<skill-name>/SKILL.md` first when a task matches that skill's
  domain.
- Use a skill-local `AGENTS.md` as extended reference material when the
  `SKILL.md` is not enough.
- Treat `skills/` as the canonical source; do not duplicate skill content under
  `.agents/`.

| Task                                        | Skill                          |
| ------------------------------------------- | ------------------------------ |
| Any change                                  | `coding-standards`             |
| React components, hooks, pages, styling     | `event-web-client-standards`   |
| Express routes, services, SQL, auth         | `event-api-standards`          |
| Registration, capacity or concurrency logic | `event-registration-integrity` |
| Writing or reviewing tests                  | `testing-standards`            |
| Preparing commits or pull requests          | `pr-guidelines`                |

## Non-negotiables

- Role and ownership checks live in the backend. Hiding a button is never an
  authorization control.
- Capacity is enforced by a single conditional `UPDATE` inside a transaction.
  Never read-then-write capacity in application code.
- All incoming data is validated with `zod` schemas at the route boundary.
- Do not disable lint rules (especially `react/exhaustive-deps`) to make code
  pass; fix the code.
- Run `npm run lint`, `npm run typecheck` and `npm test` before declaring work
  done.
