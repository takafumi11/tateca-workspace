# Mapping Guide

Map specifications to Step 3 tests for the current repo only. Use the `QA E2E Matrix` and `QA Contract E2E Matrix` from `design.md` as the authoritative row-by-row source for QA-owned shared scenarios and contract cases.

## AC Mapping

| AC condition | `scenarios/` | `scenario/testcontainers/` | `scenario/e2e/` |
|--------------|---------------|---------------------------|------------------|
| Owned AC | Create shared case | Execute | Execute |
| Not owned | Do not create | Do not execute | Do not execute |

Use `Verification entrypoint` from `design.md` to choose the surface under test.

## Contract Mapping

For every Internal API OpenAPI path owned by the current repo:

- create or update Controller Web Tests
- cover declared status codes
- cover request validation
- cover response schema and error mapping

## Consumer Interaction Notes

Translate them into assertions only when they are observable at the current repo boundary:

- visible states
- sync vs async completion
- polling or refresh behavior
- idempotent duplicate submission
