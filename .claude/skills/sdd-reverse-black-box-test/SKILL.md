---
name: sdd-reverse-black-box-test
description: Reconstructs or updates Step 3 black-box tests in GREEN for already-implemented behavior during reverse SDD. Use when reverse SDD is active and the user needs Scenario, Controller Web, or E2E backfill for the owned Step 3 surface after reverse Step 1 and reverse Step 2 (design + contract) are fixed. Not for normal SDD RED-first Step 3 work.
---

# SDD Reverse Black-Box Tests

Step 3 in reverse SDD reconstructs external verification for current behavior.
Use reverse Step 1, reverse Step 2 (`design.md` narrative + slim Internal API OpenAPI), and the implemented system as evidence.
Reverse-created Step 3 tests should start GREEN; if they do not, classify the mismatch before changing code.
Use the execution context from the active process doc; `current repo` means the repository where this step's code and tests live (see root `LOCAL_REPOSITORY_LINKS.md` for local microservice paths).
Java/Spring repos use the package layout from `platform/docs/testing.md`. Other repo types keep the same ownership rules and test responsibilities with local conventions.

## Route

| Current repo owns Step 3 verification? | Reverse Step 3 state | Route |
|----------------------------------------|----------------------|-------|
| No | Any | Skip |
| Yes | Step 3 tests missing or materially incomplete | Use this skill |
| Yes | Step 3 tests already cover current behavior well enough | Skip |

## Before Working

1. Read repository root `LOCAL_REPOSITORY_LINKS.md` when Step 3 may touch tests or code outside this repo; if missing or paths are `TBU`, stop and ask the developer to update it (copy from `LOCAL_REPOSITORY_LINKS.template.md`).
2. Read `platform/docs/sdd-reverse-process.md`.
3. Read `platform/skills/sdd-black-box-test/references/quality-bar.md` as the common Step 3 quality bar.
4. Read `platform/docs/testing.md`.
5. Verify reverse Step 1 exists and reverse Step 2 makes `Test owner`, `Verification entrypoint`, `QA E2E Matrix`, `QA Contract E2E Matrix`, and `Developer Verification Policy` clear.
6. Read owned OpenAPI when Controller Web Tests are required.
7. Read `platform/skills/sdd-black-box-test/references/ownership-routing.md` and `platform/skills/sdd-black-box-test/references/mapping-guide.md`.
8. Read [Reconstruction Checks](references/reconstruction-checks.md).

## Review loop

Complete **Review -> Triage -> Fix -> Re-review** using `platform/docs/review-record-template.md`.

- Run the common Step 3 checklist from `platform/skills/sdd-black-box-test/references/quality-bar.md`, the reverse addendum checklist in this skill, every perspective in `platform/skills/sdd-black-box-test/references/review-criteria.md`, and the shared reverse review additions in `platform/docs/sdd-reverse-process.md`.
- Record or append findings in `docs/specs/{feature}/reviews/`, using the template's `Triage` and `Status` fields.
- Fix every required issue in the reverse Step 3 assets or the minimum upstream reverse artifact, then re-review the affected perspectives.
- Close the step only when all required Critical and Major findings are resolved and every verdict is `Approved`.

**Review only:** If the user asks for review without edits, run Review and Triage only, leave open findings at `Needs Revision`, and stop.

## Workflow

### Create

1. Decide the current repo's Step 3 scope from reverse Step 2 ownership with `platform/skills/sdd-black-box-test/references/ownership-routing.md`.
2. Map owned ACs and contracts into Scenario, Controller Web, and E2E assets with `platform/skills/sdd-black-box-test/references/mapping-guide.md`. Use the `QA E2E Matrix` and `QA Contract E2E Matrix` rows from `design.md` directly.
3. Draft only the current repo's Step 3 assets.
4. Run the reverse Step 3 hygiene pass in [Reconstruction Checks](references/reconstruction-checks.md).
5. Run the drafted tests and expect GREEN. If a test is RED, classify the cause before changing code.
6. Complete the **Review loop** for this reverse Step 3 draft.

### Update

1. Read existing Step 3 tests, reverse Step 1, reverse Step 2 (`design.md` + owned OpenAPI).
2. Preserve existing verified current behavior unless the earlier reverse inference was wrong.
3. Update only the owned tests that are missing or materially incomplete.
4. Re-run the reverse Step 3 hygiene pass when owned scope, entrypoints, or contract coverage changes.
5. Re-run the affected reverse Step 3 suite and keep appending iterations to the same Step 3 reverse review file until the baseline is clean.

## Outputs

For Java/Spring repos, create or update only the Step 3 packages owned by the current repo:

- `scenarios/`
- `scenario/testcontainers/`
- `scenario/e2e/`
- `unit/controller/`

Other repo types should keep the same ownership and entrypoint rules with repo-local layout.

## Rules

- Use `platform/skills/sdd-black-box-test/references/quality-bar.md` as the common Step 3 quality bar. This skill adds only reverse-reconstruction constraints.
- Reverse current behavior; do not invent future RED expectations.
- Scope and map only the current repo's owned Step 3 surface from reverse Step 1, reverse Step 2 (`design.md` + owned OpenAPI), and the QA matrices in `design.md`.
- Reverse-created Scenario, Controller Web, and local executors should start GREEN. If they do not, classify the mismatch before code change.
- If reverse Step 2 ownership, `Verification entrypoint`, or QA matrix is unclear, stop and fix reverse Step 2 first.
- Do not use this skill for forward-looking Step 3 work that should stay RED until Step 4.

## Checklist

- [ ] The common Step 3 quality bar in `platform/skills/sdd-black-box-test/references/quality-bar.md` is satisfied
- [ ] Reverse Step 1 and reverse Step 2 are sufficient to anchor owned Step 3 scope, `Verification entrypoint`, and QA matrices
- [ ] Current Step 3 tests, owned OpenAPI, and relevant helpers were audited first
- [ ] Reverse Step 3 assets reflect current behavior only
- [ ] Reverse-created tests are GREEN or the RED cause is classified before code change
- [ ] Review loop is complete: triage recorded, fixes applied for all required Critical and Major findings, re-review done, record saved in `docs/specs/{feature}/reviews/`

## References

- `platform/skills/sdd-black-box-test/references/quality-bar.md`
- `platform/skills/sdd-black-box-test/references/ownership-routing.md`
- `platform/skills/sdd-black-box-test/references/mapping-guide.md`
- `platform/skills/sdd-black-box-test/references/review-criteria.md`
- [Reconstruction Checks](references/reconstruction-checks.md)
- `platform/docs/sdd-reverse-process.md`
- `platform/docs/testing.md`
