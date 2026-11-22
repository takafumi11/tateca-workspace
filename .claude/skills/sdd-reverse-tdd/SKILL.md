---
name: sdd-reverse-tdd
description: Reconstructs or updates Step 4 internal tests in GREEN for already-implemented behavior during reverse SDD. Use when reverse SDD is active and the current repo needs Service or Integration test protection backfilled around existing implementation after the owned reverse inputs are ready. Not for new implementation work.
---

# SDD Reverse TDD

Step 4 in reverse SDD reconstructs internal test protection for code that already exists.
Use reverse Step 1 and reverse Step 2 (`design.md` narrative + slim Internal API OpenAPI), plus owned reverse Step 3 artifacts when they apply, and current code as evidence. Do not introduce forward-looking RED tests for intended future behavior.
Reverse-created Step 4 tests should start GREEN; if they do not, classify the mismatch before changing code.
Use the execution context from the active process doc; `current repo` means the repository where this step's code and tests live (see root `LOCAL_REPOSITORY_LINKS.md` for local microservice paths).
Java/Spring repos use the package layout from `platform/docs/testing.md`. Other repo types keep the same ownership rules and test responsibilities with local conventions.

## Route

| Current repo already has implementation? | Reverse Step 4 state | Route |
|------------------------------------------|----------------------|-------|
| No | Any | Skip |
| Yes | Step 4 tests missing or materially incomplete | Use this skill |
| Yes | Existing Step 4 tests already protect current behavior well enough | Skip |

## Before Working

1. Read repository root `LOCAL_REPOSITORY_LINKS.md` when Step 4 may touch code outside this repo; if missing or paths are `TBU`, stop and ask the developer to update it (copy from `LOCAL_REPOSITORY_LINKS.template.md`).
2. Read `platform/docs/sdd-reverse-process.md`.
3. Read `platform/skills/sdd-tdd/references/quality-bar.md` as the common Step 4 quality bar.
4. Read `platform/docs/testing.md`.
5. Verify reverse Step 1 and reverse Step 2 exist, and that owned Step 3 inputs are ready when they apply.
6. Read `platform/skills/sdd-tdd/references/implementation-scope-guide.md` and `platform/skills/sdd-tdd/references/branch-audit-guide.md`.
7. Read [Reconstruction Checks](references/reconstruction-checks.md).
8. Read current code and existing unit / integration tests for the owned behavior.

## Review loop

Complete **Review -> Triage -> Fix -> Re-review** using `platform/docs/review-record-template.md`.

- Run the common Step 4 checklist from `platform/skills/sdd-tdd/references/quality-bar.md`, the reverse addendum checklist in this skill, every perspective in `platform/skills/sdd-tdd/references/review-criteria.md`, and the shared reverse review additions in `platform/docs/sdd-reverse-process.md`.
- Record or append findings in `docs/specs/{feature}/reviews/`, using the template's `Triage` and `Status` fields.
- Fix every required issue in the Step 4 tests or the minimum upstream reverse artifact, then re-review the affected perspectives.
- Close the step only when all required Critical and Major findings are resolved and every verdict is `Approved`.

**Review only:** If the user asks for review without edits, run Review and Triage only, leave open findings at `Needs Revision`, and stop.

## Workflow

### Create

1. Confirm current-repo Step 4 scope with `platform/skills/sdd-tdd/references/implementation-scope-guide.md`.
2. Run `platform/skills/sdd-tdd/references/branch-audit-guide.md` when existing methods or behavior branches need coverage expansion.
3. Map reverse Step 1 and reverse Step 2 (`design.md` + owned OpenAPI), plus owned reverse Step 3 artifacts when they apply, and current code into the owned Step 4 test scope. Cover developer-only branches called out in the `design.md` `Dev-Only Verification` table.
4. Add or update only the current repo's unit and integration tests needed to protect current behavior.
5. Run the reverse Step 4 hygiene pass in [Reconstruction Checks](references/reconstruction-checks.md).
6. Run the affected Step 4 suite and expect GREEN. If a test is RED, classify the cause before changing code.
7. Complete the **Review loop** for this reverse Step 4 draft.

### Update

1. Read current code, existing Step 4 tests, reverse Step 1, reverse Step 2, and owned Step 3 artifacts when they apply.
2. Preserve existing verified current behavior unless the earlier reverse inference was wrong.
3. Update only the owned Step 4 tests that are missing or materially incomplete.
4. Re-run the branch audit when expanding coverage around existing methods or behavior branches.
5. Re-run the reverse Step 4 hygiene pass when owned scope, test layering, or Step 3 / contract alignment changes.
6. Re-run the affected Step 4 suite and keep appending iterations to the same Step 4 reverse review file until the baseline is clean.

## Outputs

For Java/Spring repos, create or update only the current repo's Step 4 packages:

- `unit/service/`
- `integration/service/`

Other repo types keep the same ownership rules but use repo-local test layout.

## Rules

- Use `platform/skills/sdd-tdd/references/quality-bar.md` as the common Step 4 quality bar. This skill adds only reverse-reconstruction constraints.
- Reverse current behavior; do not invent future implementation work.
- Protect only the current repo's owned current behavior and internal branches.
- Reverse-created Step 4 tests should start GREEN. If they do not, classify the mismatch before code change.
- If reverse Step 1 and reverse Step 2, plus owned reverse Step 3 artifacts when they apply, do not make owned scope or expectations clear enough, stop and fix the missing reverse artifact first.
- If protecting the intended behavior would require new implementation rather than reconstructing the current baseline, stop and treat that work as a later normal SDD pass.
- Do not use this skill to mix reverse documentation with new feature development.
- **Spec-anchored reverse implementation.** Reverse Step 4 may not silently push code-shaped facts back into the reverse Step 2 baseline. If reverse Step 4 reveals that the reverse `design.md` or reverse slim OpenAPI does not match current behavior, stop and fix the reverse Step 2 artifact through a `sdd-reverse-design-and-contract` review iteration. Resume reverse Step 4 only after that review record reaches `Approved`.
- **Schema-validation contract test is mandatory** when this repo owns the Internal API contract, even in reverse mode. The artifact lives in the existing Controller Web Test slot, loads the reverse Step 2 OpenAPI YAML at runtime, and must be GREEN against current behavior. The rule, the per-test acceptance criteria, and the failure-triage paths live in `platform/skills/sdd-tdd/references/quality-bar.md`. If the artifact is missing on existing implementation, reverse Step 4 must add it. A red reverse schema-validation test is a hard stop and triggers either an implementation fix (when current behavior accidentally diverged) or a reverse Step 2 review iteration (when the reverse baseline was wrong).

## Checklist

- [ ] The common Step 4 quality bar in `platform/skills/sdd-tdd/references/quality-bar.md` is satisfied
- [ ] Current repo already has implementation for the owned scope
- [ ] Reverse Step 1 and Step 2, plus owned Step 3 artifacts when they apply, are sufficient to anchor owned Step 4 scope
- [ ] Current code and existing Step 4 tests were audited first
- [ ] Reverse Step 4 tests reflect current behavior only
- [ ] `Dev-Only Verification` branches owned by this repo are covered with appropriate local proof
- [ ] No spec-vs-implementation drift was silently absorbed into reverse Step 4 tests; any disagreement was routed to a `sdd-reverse-design-and-contract` review iteration first
- [ ] When this repo owns the Internal API contract, the schema-validation contract test exists in `unit/controller/`, loads the reverse Step 2 OpenAPI YAML at runtime, validates request / response / status / grouped error examples against current behavior, and is GREEN
- [ ] Affected Step 4 suite is GREEN or the RED cause is classified before code change
- [ ] No new implementation work is mixed into the reverse pass
- [ ] Review loop is complete: triage recorded, fixes applied for all required Critical and Major findings, re-review done, record saved in `docs/specs/{feature}/reviews/`

## References

- `platform/skills/sdd-tdd/references/quality-bar.md`
- `platform/skills/sdd-tdd/references/implementation-scope-guide.md`
- `platform/skills/sdd-tdd/references/branch-audit-guide.md`
- `platform/skills/sdd-tdd/references/review-criteria.md`
- [Reconstruction Checks](references/reconstruction-checks.md)
- `platform/docs/sdd-reverse-process.md`
- `platform/docs/testing.md`
