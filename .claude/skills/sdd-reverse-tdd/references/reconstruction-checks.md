# Reverse Reconstruction Checks (Step 4)

Use this file alongside `platform/skills/sdd-tdd/references/quality-bar.md` during reverse Step 4 hygiene after the first draft and again before closing review findings.
This file covers reverse-only failure modes and hygiene checks beyond the shared Step 4 quality bar.

## Evidence Priority

Use sources in this order:

1. Current reverse Step 1 and Step 2 artifacts for the owned scope, plus owned reverse Step 3 artifacts when they apply
2. Current implementation code and current Step 4 tests in the repo
3. Current runtime, persistence, or integration behavior needed to confirm idempotency, retry, or recovery branches
4. Existing docs in the current repo
5. Sibling specs only as sanity checks for layering or naming patterns

If sources disagree, do not smooth the drift away. Surface the conflict in the review record and keep the Step 4 baseline grounded in the strongest current-behavior evidence.

## Common Reverse Step 4 Failure Modes

- Inventing future implementation behavior or new branches that current code does not contain
- Protecting another repo's behavior in Step 4 instead of the current repo's owned logic
- Duplicating business-flow verification in unit or integration tests when Step 3 already owns it
- Converting unit-test-worthy logic into integration-only coverage without real infrastructure need
- Changing code immediately when reverse-created tests are RED instead of classifying stale tests, missing setup, or behavior drift
- Leaving idempotency, retry, recovery, or no-op branches unprotected even though current code already implements them
- Skipping `Dev-Only Verification` branches called out in `design.md` when they are owned by this repo
- Borrowing sibling-spec test shapes or helper patterns as if they were proof of current behavior here
- Silently absorbing spec-vs-implementation drift into reverse Step 4 tests instead of routing the disagreement back to a `sdd-reverse-design-and-contract` review iteration. Reverse Step 4 must not push code-shaped facts into the reverse Step 2 baseline silently; the reverse Step 2 review is the only allowed channel.
- Skipping the schema-validation contract test when this repo owns the Internal API contract, or weakening it (hardcoded paths, schema assertions removed, examples not exercised). The artifact must load the reverse Step 2 OpenAPI YAML at runtime and validate request / response / status / grouped error examples; the rule and the failure-triage paths live in `platform/skills/sdd-tdd/references/quality-bar.md`.

## Reverse Step 4 Hygiene Pass

Before closing the draft, confirm all of the following:

- Step 4 tests protect only the current repo's owned logic and infrastructure behavior
- Unit vs integration layering matches the real infrastructure boundary
- Step 3 business-flow verification is not duplicated in Step 4
- Contract-sensitive behavior stays aligned with owned Step 3 assets or owned contract surfaces where applicable
- Developer-only branches from `design.md` `Dev-Only Verification` owned by this repo are covered with appropriate local proof
- Spec-anchored reverse implementation rule is honored: any disagreement between current code and reverse Step 2 was raised as a reverse Step 2 review iteration, not absorbed into Step 4 tests
- When this repo owns the Internal API contract, the schema-validation contract test exists in `unit/controller/`, loads the reverse Step 2 OpenAPI YAML at runtime, validates request / response / status codes / grouped error examples against current behavior, and is GREEN
- Reverse-created Step 4 tests are GREEN, or the RED mismatch is explicitly classified before any code change
- Any missing Step 4 coverage is traced back to a current code path or owned behavior branch instead of guessed

## Sibling Spec Usage

Sibling specs can help spot cleaner unit vs integration splits, helper placement, or naming, but they are not evidence.
Use them only to ask questions such as:

- "Is this repo pushing pure branch logic into integration tests when sibling specs keep it at unit level?"
- "Is this test protecting current owned code here, or copied from another repo's behavior?"
- "Is this missing branch really present in current code, or borrowed from a nearby feature?"
