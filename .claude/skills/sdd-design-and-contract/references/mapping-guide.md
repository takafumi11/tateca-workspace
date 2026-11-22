# Mapping Guide (Step 1 + `design.md` -> Internal API OpenAPI)

Translate `requirements.md` and the `design.md` narrative half into the slim Internal API OpenAPI surface.
This guide complements [Contract Scope Guide](contract-scope-guide.md), which defines what is allowed and forbidden in OpenAPI.

## Source Mapping

| Source | OpenAPI output |
|--------|----------------|
| Happy-path ACs | Success response and response schema |
| Business-visible rejection ACs | Response status, internal error code, and one grouped example per `(HTTP status, internal error code)` pair |
| Auth or permission preconditions | `401` / `403` behavior with grouped example |
| Invalid-input AC | Request-schema validation rules + invalid-input grouped examples per error code variant |
| `Consumer Interaction Notes` in `design.md` | Idempotency, sync vs async completion, or polling notes captured as a one-line `Business Rules` bullet referencing AC IDs |
| `External Outcome Mapping Snapshot` in `design.md` | Status-code mapping in `responses:` only — the narrative stays in `design.md` |
| Existing released behavior | Compatibility constraints and preserved status / error semantics |

## AC -> Business Rules Mapping

For each AC group from `requirements.md`, write at most one Business Rules bullet in OpenAPI. Use this template:

```
{N}. **{Short caller-facing label}**: {one-line caller-visible behavior}. {AC IDs and / or design.md section reference}.
```

Examples:

```
1. **Transaction Uniqueness & Idempotency**: txKey must be unique to prevent duplicate transactions (R2-AC1; see `design.md` -> Canonical Testable Flows -> Request Flow).
2. **Daily Limit**: Combined deposit and withdraw operations cannot exceed 10 per day per user (R3-AC1; see `design.md` -> Assertion Rules For Test Authors).
```

Do not restate the rule in narrative form. Reference `design.md` instead.

## AC -> Response Mapping

For each rejection AC, derive `(HTTP status, internal error code, message, example file)` and add the code as both:

1. A row in the per-response `Internal code | Message` markdown table embedded in that response's `description:`.
2. A grouped example sibling under that response's `examples:` block, referencing its own `components/examples/errors/{code}-{slug}.yaml` file.

Do not introduce new HTTP statuses or error codes that are not justified by an AC or a `Canonical Testable Flows` branch.

When several internal error codes share the same HTTP status, add them as siblings under the same response — both as table rows and as grouped examples.

## Drafting Rules

- Write from the caller perspective. The caller is usually another backend repo such as Ajax, Batch, or another internal product.
- Keep the description short. Treat the design narrative as the long-form source.
- Validation rules belong in schemas, not in description text.
- Each example lives in its own file under `components/examples/errors/`.
- Do not copy flow diagrams, repo-ownership prose, internal retry detail, Saga step prose, or persistence-rule prose from `design.md` into OpenAPI. Reference the relevant `design.md` section instead.
- When the contract changes, update the matching `design.md` section first (or in the same review pass) so that narrative and contract stay coherent.
