# Reverse Reconstruction Checks

Use this file alongside `platform/skills/sdd-requirements/references/quality-bar.md` during reverse Step 1 hygiene after the first draft and again before closing review findings.
This file covers reverse-only failure modes and hygiene checks beyond the shared Step 1 quality bar.

## Evidence Priority

Use sources in this order:

1. Current code and passing behavior
2. Current black-box or internal tests
3. Current OpenAPI or other published contract files
4. Existing docs in the current repo
5. Sibling specs only as sanity checks for wording or boundary patterns

Within test evidence, prefer scenarios, integration tests, and service-level tests that exercise real current behavior.
Treat controller or web tests built from synthetic mocks as weaker evidence when they can simulate branches that the current implementation does not actually reach.

If sources disagree, do not guess. Surface the conflict in the review record and keep the draft anchored to the strongest current-behavior evidence.

## Reverse Evidence Failure Modes

- Copying quantitative limits or ownership assumptions from stale notes without checking current design or contract evidence
- Treating mocked controller or web tests as primary proof of reachable current behavior even though they may only prove validation or error mapping for injected exceptions
- Borrowing sibling-spec wording as if it were proof of current behavior in this repo

## Reverse Step 1 Hygiene Pass

Before closing the draft, confirm all of the following:

- `requirements.md` states only business-visible current behavior
- Common Step 1 quality checks in `platform/skills/sdd-requirements/references/quality-bar.md` have been applied
- Request-time and recovery or batch paths are written as separate business boundaries when both exist
- Quantitative targets and ownership assumptions match the current design or contract baseline, or the drift is called out explicitly

## Sibling Spec Usage

Sibling specs can help spot cleaner boundary patterns or vocabulary, but they are not evidence.
Use them only to ask questions such as:

- "Is this repo mixing request-time and recovery wording when a sibling spec separates them clearly?"
- "Is this feature naming a contract field in Step 1 when sibling specs keep that mapping in design or contract artifacts?"
- "Is this feature naming an operation or endpoint in Step 1 when sibling specs describe the same surface in business terms?"
- "Is there already an accepted business term in sibling specs that keeps Step 1 vocabulary consistent without importing their design detail?"
- "Is this scope wording duplicating another section instead of expressing one business capability?"
