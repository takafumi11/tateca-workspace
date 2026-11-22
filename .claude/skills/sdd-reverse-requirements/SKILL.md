---
name: sdd-reverse-requirements
description: Reconstructs missing `requirements.md` for Step 1 in reverse SDD from current behavior. Use when reverse SDD is active and the user needs a baseline Step 1, AC or GIVEN/WHEN/THEN backfill, current-behavior review, or a review-only pass for an implemented feature whose baseline Step 1 is missing. Not for normal SDD or rewriting a pre-existing baseline Step 1.
---

# SDD Reverse Requirements

`requirements.md` is the reverse Step 1 baseline for business-visible current behavior.
Use current code, docs, OpenAPI, and tests as evidence. Do not invent intended behavior.
Use the execution context from the active process doc; `current repo` means the repository where this step's code and tests live (see root `LOCAL_REPOSITORY_LINKS.md` for local microservice paths).

## Route

| Reverse Step 1 state | Route |
|----------------------|-------|
| `requirements.md` missing | Create |
| Reverse-created `requirements.md` needs cleanup before confirmation | Update in the same Step 1 reverse review file |
| Baseline Step 1 already existed before reverse selection | Stop and use normal SDD |

## Before Working

1. Read repository root `LOCAL_REPOSITORY_LINKS.md` when inventory crosses repositories; if missing or paths are `TBU`, stop and ask the developer to update it (copy from `LOCAL_REPOSITORY_LINKS.template.md`).
2. Read `platform/docs/sdd-reverse-process.md`.
3. Read `platform/skills/sdd-requirements/references/quality-bar.md` as the common Step 1 quality bar.
4. Read [Reconstruction Checks](references/reconstruction-checks.md).
5. Read `platform/docs/testing.md` only for scenario coverage and validation boundaries.
6. Audit implementation, nearby docs, OpenAPI, and tests using the workflow in `platform/docs/sdd-reverse-process.md`.
7. Confirm this reverse pass was selected because baseline Step 1 is missing.

## Review loop

Complete **Review -> Triage -> Fix -> Re-review** using `platform/docs/review-record-template.md`.

- Run the common Step 1 checklist from `platform/skills/sdd-requirements/references/quality-bar.md`, the reverse addendum checklist in this skill, every perspective in `platform/skills/sdd-requirements/references/review-criteria.md`, and the shared reverse review additions in `platform/docs/sdd-reverse-process.md`.
- Record or append findings in `docs/specs/{feature}/reviews/`, using the template's `Triage` and `Status` fields.
- Fix every required issue in `requirements.md` or the minimum downstream handoff, then re-review the affected perspectives.
- Close the step only when all required Critical and Major findings are resolved and every verdict is `Approved`.

**Review only:** If the user asks for review without edits, run Review and Triage only, leave open findings at `Needs Revision`, and stop.

## Workflow

### Create

1. Build a short evidence inventory from code, tests, OpenAPI, and existing docs. Use sibling specs only as sanity checks for naming or boundary patterns.
2. Surface conflicts across code, docs, tests, and OpenAPI before drafting. If a conflict cannot be resolved from current behavior, record the conflict instead of guessing.
3. Draft `requirements.md` in the current repo's established Step 1 style using only durable business-visible behavior.
4. Run the reverse Step 1 hygiene pass from `platform/docs/sdd-reverse-process.md` and [Reconstruction Checks](references/reconstruction-checks.md).
5. Complete the **Review loop** for this reverse Step 1 draft.

### Update

1. Read the reverse-created `requirements.md` and the review record.
2. Preserve confirmed current behavior unless the earlier reverse inference was wrong.
3. Update only wording, scope, or ACs needed to make the reconstructed baseline accurate.
4. Re-run the reverse Step 1 hygiene pass when wording touches dependency boundaries, recovery wording, or quantitative limits.
5. Keep appending iterations to the same Step 1 reverse review file until the baseline is clean.

## Rules

- Use `platform/skills/sdd-requirements/references/quality-bar.md` as the common Step 1 quality bar. This skill adds only reverse-reconstruction constraints.
- Reverse current behavior; do not invent intended behavior.
- Build the draft from current code, tests, contracts, and existing docs in evidence order.
- If evidence conflicts cannot be resolved from current behavior, surface the conflict instead of guessing.
- Use sibling specs only as sanity checks for wording and boundary patterns. They are not primary evidence.
- Do not use this skill to tidy a pre-existing baseline Step 1 that should be handled by normal SDD.

## Checklist

- [ ] The common Step 1 quality bar in `platform/skills/sdd-requirements/references/quality-bar.md` is satisfied
- [ ] Reverse selection is valid because baseline Step 1 is missing
- [ ] Implementation, nearby docs, OpenAPI, and tests were audited first
- [ ] Conflicts across evidence are resolved or explicitly surfaced
- [ ] Draft reflects current behavior only
- [ ] Sibling specs were used only as sanity checks, not as primary evidence
- [ ] Review loop is complete: triage recorded, fixes applied for all required Critical and Major findings, re-review done, record saved in `docs/specs/{feature}/reviews/`

## References

- `platform/skills/sdd-requirements/references/quality-bar.md`
- `platform/skills/sdd-requirements/references/review-criteria.md`
- [Reconstruction Checks](references/reconstruction-checks.md)
- `platform/docs/sdd-reverse-process.md`
- `platform/docs/testing.md`
