# Ownership Routing

This file decides what the current repo creates in Step 3.

## Read In Order

1. `requirements.md`
2. `design.md` (including `AC Ownership Matrix`, `QA E2E Matrix`, `QA Contract E2E Matrix`, `Developer Verification Policy`)
3. Current repo OpenAPI when Controller Web Tests are in scope
4. `platform/docs/testing.md`

## Routing

| Current repo condition | Create in Step 3 |
|------------------------|------------------|
| `Test owner` for at least one AC | `scenarios/`, `scenario/testcontainers/`, `scenario/e2e/` |
| Owns the Step 2 Internal API OpenAPI contract | `unit/controller/` |
| Supporting repo only, no owned AC and no owned Internal API contract | Nothing for that feature |

## Rules

- Do not duplicate business AC verification across repos.
- Put AC logic in `scenarios/` once. Executors only run that shared set.
- Team ownership does not override repo ownership.
- Supporting repos verify only their own orchestration or contract behavior.
- `Verification entrypoint` must be executable by the `Test owner`.

If the entrypoint points to another repo's surface, fix `design.md` first.
