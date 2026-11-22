---
name: sdd-black-box-test
description: Creates or updates Step 3 black-box tests in RED for the current repo in normal SDD. Use when the user needs Scenario, Controller Web, or E2E tests, AC-to-test mapping, or Step 3 review after Step 1 requirements and Step 2 (design + contract) are fixed. Not for Step 4 implementation work or reverse SDD.
---

# SDD Black-Box Tests

Step 3 creates external specification tests in RED for the current repo only in normal SDD.
Keep ACs in `requirements.md`, ownership and canonical testable flows in `design.md`, and HTTP detail in the slim Internal API OpenAPI surface produced by Step 2.
Use the execution context from the active process doc; `current repo` means the repository where this step's code and tests live (see root `LOCAL_REPOSITORY_LINKS.md` for local microservice paths).
Java/Spring repos use the package layout from `platform/docs/testing.md`. Other repo types keep the same ownership rules and test responsibilities with local conventions.

## Route

| Current repo owns Step 3 verification? | Step 3 asset state | Route |
|----------------------------------------|--------------------|-------|
| No | Any | Skip Step 3 |
| Yes | Owned Step 3 assets missing | Create |
| Yes | Owned Step 3 assets already exist | Update |

## Before Working

1. Read repository root `LOCAL_REPOSITORY_LINKS.md` when Step 3 may touch tests or code outside this repo; if missing or paths are `TBU`, stop and ask the developer to update it (copy from `LOCAL_REPOSITORY_LINKS.template.md`).
2. Read `platform/docs/sdd-process.md`.
3. Read [Quality Bar](references/quality-bar.md).
4. Read `platform/docs/testing.md`.
5. Verify `docs/specs/{feature}/requirements.md` is finalized for Step 3 drafting.
6. Read finalized `design.md` for `AC Ownership Matrix`, `Consumer Interaction Notes`, `Canonical Testable Flows`, `Assertion Rules For Test Authors`, `QA E2E Matrix`, `QA Contract E2E Matrix`, `Developer Verification Policy`, and `Verification entrypoint`.
7. Read the finalized current repo's OpenAPI when Controller Web Tests are required.
8. Use [Ownership Routing](references/ownership-routing.md) and [Mapping Guide](references/mapping-guide.md).

If `design.md` is missing or does not make ownership, verification entrypoints, QA matrix, and developer policy clear, stop and fix Step 2 first.

## Review loop

Complete **Review -> Triage -> Fix -> Re-review** using `platform/docs/review-record-template.md`.

- Run the common Step 3 checklist in [Quality Bar](references/quality-bar.md), this skill's addendum checklist, and every perspective in [Review Criteria](references/review-criteria.md).
- Record or append findings in `docs/specs/{feature}/reviews/`, using the template's `Triage` and `Status` fields.
- Fix every required issue in the Step 3 assets or the minimum upstream spec, then re-review the affected perspectives.
- Close the step only when all required Critical and Major findings are resolved and every verdict is `Approved`.

**Review only:** If the user asks for review without edits, run Review and Triage only, leave open findings at `Needs Revision`, and stop.

## Workflow

### Create

1. Decide the current repo's Step 3 scope with [Ownership Routing](references/ownership-routing.md).
2. Map owned ACs and contracts with [Mapping Guide](references/mapping-guide.md). Use the `QA E2E Matrix` and `QA Contract E2E Matrix` in `design.md` as the canonical scenario lists for QA-owned shared and contract cases.
3. Draft only the current repo's Step 3 assets. New or changed Scenario and Controller Web tests should fail until Step 4. Mirror the QA-owned shared scenarios into the local Testcontainers executor so developers can prove the same response, DB, and KVS outcomes.
4. Complete the **Review loop** for this draft.

### Update

1. Read existing black-box tests, `requirements.md`, `design.md`, and owned OpenAPI.
2. Preserve existing verified behavior unless the specification changed.
3. Update only tests owned by the current repo.
4. When AC coverage, ownership, entrypoints, or contract coverage changes, complete the **Review loop** again (update the existing review file with a new iteration).

## Outputs

For Java/Spring repos, create only the Step 3 packages owned by the current repo:

- `scenarios/` - shared AC cases
- `scenario/testcontainers/` - local executor
- `scenario/e2e/` - staging executor
- `unit/controller/` - Internal API contract tests when the current repo owns the Step 2 OpenAPI surface

If the repo is not the `Test owner`, it may omit the scenario packages.
Other repo types should keep the same ownership and entrypoint rules, but use repo-local test layout.

## Rules

- Use [Quality Bar](references/quality-bar.md) as the common Step 3 quality bar. This skill adds only normal-input constraints.
- Decide the current repo's Step 3 scope with [Ownership Routing](references/ownership-routing.md) and [Mapping Guide](references/mapping-guide.md) before drafting tests.
- New or changed Scenario and Controller Web tests should fail until Step 4 implementation catches up.
- Step 3 E2E output means a staging-oriented `{Feature}E2ETest` executor prepared before implementation.
- The QA E2E and QA Contract matrices in `design.md` are authoritative for QA scope. Use them directly for shared scenarios and contract tests.

## Checklist

- [ ] The common Step 3 quality bar in [Quality Bar](references/quality-bar.md) is satisfied
- [ ] `requirements.md`, `design.md`, and any owned OpenAPI contract are finalized before Step 3 drafting begins
- [ ] Step 3 scope is confirmed for the current repo
- [ ] New or changed Scenario and Controller Web tests fail until Step 4
- [ ] E2E executor is prepared for staging execution
- [ ] Review loop is complete: triage recorded, fixes applied for all required Critical and Major findings, re-review done, record saved in `docs/specs/{feature}/reviews/`

## References

- [Quality Bar](references/quality-bar.md)
- [Ownership Routing](references/ownership-routing.md)
- [Mapping Guide](references/mapping-guide.md)
- [Review Criteria](references/review-criteria.md)
- `platform/docs/sdd-process.md`
- `platform/docs/testing.md`
