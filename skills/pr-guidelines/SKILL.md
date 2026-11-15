---
name: pr-guidelines
description: Guide the preparation and review of pull requests, including semantic commits and concise What/Why/How descriptions.
metadata:
    author: event-management-app
    scope: capability
---

# PR Guidelines

## Commits

- Semantic commits with a capability scope:
  `feat(events): prevent capacity below active registrations`.
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`.
- Scopes: `api`, `web`, `auth`, `events`, `registrations`, `dashboard`,
  `db`, `skills`, `repo`.
- One coherent change per commit. If the scope is unclear, ask.

## Pull requests

- Follow `.github/PULL_REQUEST_TEMPLATE.md` and keep its sections.
- Keep What, Why, and How as `###` subsections.
- Include step-by-step testing instructions and the commands you ran.

## Pre-flight checklist

- [ ] `npm run lint`, `npm run typecheck` and `npm test` pass.
- [ ] New components have stories and mdx docs.
- [ ] New env variables are documented in `.env.example` and README.
- [ ] Description covers What, Why, How and Testing concisely.
