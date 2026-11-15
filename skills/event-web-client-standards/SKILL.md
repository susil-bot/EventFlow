---
name: event-web-client-standards
description: Enforce React/TypeScript client standards for apps/web — component folders, Single Responsibility, hooks rules, styled-components v6 transient props, design tokens, data hooks and UI states. Use when creating or reviewing React components, hooks or pages.
license: MIT
metadata:
    author: event-management-app
    version: '1.0'
---

# Web Client Standards

## When to Apply

- Creating or editing anything under `apps/web/src`
- Reviewing client-side code

## Quick Reference

### Component layers

| Layer                  | May import                   | Must not                  |
| ---------------------- | ---------------------------- | ------------------------- |
| `components/elements`  | styles, tokens               | call APIs, use routing    |
| `components/patterns`  | elements, utils              | call APIs (take props)    |
| `components/templates` | elements, patterns, auth ctx | own page data             |
| `pages`                | hooks, patterns, templates   | contain raw styled markup |
| `hooks`                | `api/`, TanStack Query       | render UI                 |

### Every component folder contains

`Component.tsx`, `Component.stories.tsx`, `Component.mdx`, `styles.ts`,
`index.ts` and, when it has logic, `Component.spec.tsx`.

### React rules

- No `defaultProps` — use default parameters.
- No disabling `react/exhaustive-deps`.
- Forms: controlled inputs, labels tied with `htmlFor`/`id`, errors linked via
  `aria-describedby`, `aria-invalid` on invalid fields.

### Styled Components v6

- `styled.x.withConfig({ displayName: 'Name' })` on every styled part.
- Styling-only props are transient: `$variant`, `$tone`, `$fullWidth`.
- Colours/spacing via `var(${Design.Color.X})` from `styles/tokens.ts`.

### Data and UI states

- Fetch with hooks in `src/hooks` (TanStack Query). Pages wrap content in
  `StateView` to render loading, error (with retry) and empty states.
- Mutations: invalidate affected queries, show a toast with the server's
  `error.message` on failure and a short success message on success.
- Never trust the client for authorization; role-gated routes only improve
  UX.

## How to Use

Read this file first. Open `CODING_STANDARDS.md` sections 3–9 for examples.
