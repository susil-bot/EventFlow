# AGENTS.md

This file provides guidance to AI coding agents when working with the shared
skills in this repository.

## Available Skills

| Skill                                                           | Description                                                |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| [coding-standards](./coding-standards/)                         | Shared TypeScript, naming and repository practices         |
| [event-web-client-standards](./event-web-client-standards/)     | React, styled-components v6, component folders, data hooks |
| [event-api-standards](./event-api-standards/)                   | Express layering, validation, errors, auth, SQL            |
| [event-registration-integrity](./event-registration-integrity/) | Capacity, duplicates and concurrency rules                 |
| [testing-standards](./testing-standards/)                       | Jest/Vitest conventions and required coverage              |
| [pr-guidelines](./pr-guidelines/)                               | Semantic commits and PR descriptions                       |

## Using Skills

Each skill directory contains:

- `SKILL.md` - Lightweight entry point with metadata and summary
- `AGENTS.md` - Full rules and examples (optional for small skills)

**To apply a skill:** read `SKILL.md` first. Open `AGENTS.md` in the same
directory only when you need the longer reference material.

## Skill Structure

```text
skills/
  {skill-name}/
    SKILL.md              # Required: skill definition with frontmatter
    AGENTS.md             # Optional: full compiled rules
    references/           # Optional: supporting docs
```

Use kebab-case for skill directory names.
