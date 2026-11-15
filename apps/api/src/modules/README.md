# API modules

Each folder is one feature area with the same layers:

| File / folder   | Responsibility                                                    |
| --------------- | ----------------------------------------------------------------- |
| `routes.ts`     | Paths and middleware: `authenticate` → `authorize` → `validate`   |
| `controller.ts` | Reads the validated request, calls the service, sends `{ data }`  |
| `service`       | Business rules, ownership checks, transactions; throws `AppError` |
| `repository`    | Parameterised SQL; returns typed rows; no HTTP knowledge          |
| `schemas`       | zod request schemas and the input types inferred from them        |
| `mappers.ts`    | Row (snake_case) → DTO (camelCase), in one place                  |
| `types.ts`      | Row, DTO and domain types                                         |

A layer starts as a single file. When it passes ~300 lines it becomes a
folder with an `index.ts` that re-exports its public API, split by concern.
`events/` is the example:

```text
events/
  service/      queries.ts · commands.ts · access.ts · schedule.ts
                event-type.ts · slug.ts · errors.ts · index.ts
  repository/   events.ts · slots.ts · images.ts · attendees.ts
                columns.ts · index.ts
  schemas/      create-event.ts · update-event.ts · params.ts · fields.ts
                slots.ts · social-links.ts · refinements.ts · urls.ts
                limits.ts · index.ts
```

Other modules import a layer through its folder (`'../events/repository'`),
never a file inside it.
