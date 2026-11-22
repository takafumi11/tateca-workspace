# Reverse Reconstruction Checks (Step 3)

Use this file alongside `platform/skills/sdd-black-box-test/references/quality-bar.md` during reverse Step 3 hygiene after the first draft and again before closing review findings.
This file covers reverse-only failure modes and hygiene checks beyond the shared Step 3 quality bar.

## Evidence Priority

Use sources in this order:

1. Current reverse Step 1 ACs plus reverse Step 2 `Test owner`, `Verification entrypoint`, `QA E2E Matrix`, `QA Contract E2E Matrix`, and `Developer Verification Policy`
2. Current Step 3 tests and current Controller Web tests in the repo
3. Current owned OpenAPI and current observable runtime behavior
4. Current Step 3 helpers, executors, and CI execution patterns
5. Existing docs in the current repo
6. Sibling specs only as sanity checks for naming or package patterns

If sources disagree, do not smooth the drift away. Surface the conflict in the review record and keep the Step 3 baseline grounded in the strongest current-behavior evidence.
When shared helpers or fixtures normalize the baseline state and hide an owned AC branch, treat that as a setup gap to fix rather than proof that the branch is out of scope.

## Common Reverse Step 3 Failure Modes

- Inventing future RED expectations or idealized Step 3 structure that current behavior does not support
- Reconstructing another repo's verification surface instead of the current repo's owned Step 3 scope
- Splitting the same owned AC verification across multiple shared cases or across multiple repos
- Letting `scenario/testcontainers/` and `scenario/e2e/` diverge from the same owned shared-case set
- Adding Controller Web Tests when the repo does not own the Internal API contract, or omitting them when it does
- Changing code immediately when reverse-created tests are RED instead of classifying whether the mismatch is stale spec, setup gap, or behavior drift
- Letting shared fixtures or setup helpers pre-create one default baseline state so aggressively that first-time, missing-state, already-processed, or other owned current-state branches can no longer be expressed
- Letting executor-specific helper methods become silent no-ops for newly added shared assertions, which overstates local or staging verification and hides a Step 3 coverage gap
- Borrowing sibling-spec package layout or helper patterns as if they were proof of current behavior here

## Reverse Step 3 Hygiene Pass

Before closing the draft, confirm all of the following:

- Step 3 assets verify only the current repo's owned surface
- Owned AC cases are defined once and reused across executors where applicable, mirroring the `QA E2E Matrix` rows from `design.md`
- `scenario/testcontainers/`, `scenario/e2e/`, and Controller Web coverage stay aligned to the same owned Step 3 surface
- Executor helpers perform the shared assertions they claim, or any temporary executor-side verification gap is called out explicitly in the review record
- Shared setup and helpers can express each owned AC branch, including first-time, missing-state, already-processed, and repeated-request states when those outcomes are business-visible
- `Verification entrypoint` matches reverse Step 2 ownership and routing
- Reverse-created tests are GREEN, or the RED mismatch is explicitly classified before any code change
- Any missing Step 3 coverage is traced back to Step 2 ownership or contract scope instead of guessed

## Sibling Spec Usage

Sibling specs can help spot cleaner package patterns, helper placement, or scenario naming, but they are not evidence.
Use them only to ask questions such as:

- "Is this repo duplicating the same AC verification across executors when sibling specs centralize it once?"
- "Is this Controller Web coverage actually owned here, or copied from another repo pattern?"
- "Is this test shape grounded in current behavior here, or copied from a nearby feature?"
