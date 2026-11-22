---
name: sdd-tdd
description: Creates or updates Step 4 implementation for the current repo in normal SDD. Use when the user needs Step 4 code changes, service unit tests, integration tests, or owned Step 3 assets turned GREEN after the repo's specs are ready. Not for frontend-team implementation.
---

# SDD TDD

Step 4 covers implementation and internal tests for the current repo only.
Keep ACs in `requirements.md`, ownership and canonical testable flows in `design.md`, contract detail in the slim Internal API OpenAPI surface, and external tests in Step 3.
Use the execution context from the active process doc; `current repo` means the repository where this step's code and tests live (see root `LOCAL_REPOSITORY_LINKS.md` for local microservice paths).
Java/Spring repos use the package layout from `platform/docs/testing.md`. Other repo types keep the same ownership rules and test responsibilities with local conventions.

## Route

| Current repo has code changes? | Owned Step 3 assets ready? | Route |
|--------------------------------|----------------------------|-------|
| No | Any | Skip Step 4 |
| Yes | No | Finish Step 3 first |
| Yes | Yes or not applicable | Use this skill |

A supporting repo may still need Step 4 even when another repo owns primary AC verification.

## Before Working

1. Read repository root `LOCAL_REPOSITORY_LINKS.md` when Step 4 may touch code outside this repo; if missing or paths are `TBU`, stop and ask the developer to update it (copy from `LOCAL_REPOSITORY_LINKS.template.md`).
2. Read `platform/docs/sdd-process.md`.
3. Read [Quality Bar](references/quality-bar.md).
4. Read `platform/docs/testing.md`.
5. Verify `docs/specs/{feature}/requirements.md` exists and is finalized.
6. Verify owned OpenAPI and owned Step 3 assets are ready when they apply, and that any upstream contract dependencies are already fixed. The owned slim Internal API OpenAPI is the contract baseline for Step 4; do not start implementation against an outdated YAML.
7. Read `design.md` for ownership, canonical flows with DB and KVS side effects per node, recovery routing, state model, assertion rules, and the `Developer Verification Policy`. If it is missing or does not make repo boundaries or developer-only branches clear, stop and fix Step 2 first.
8. Use [Implementation Scope Guide](references/implementation-scope-guide.md).

## Review loop

Complete **Review -> Triage -> Fix -> Re-review** using `platform/docs/review-record-template.md`.

- Run the common Step 4 checklist in [Quality Bar](references/quality-bar.md), this skill's addendum checklist, and every perspective in [Review Criteria](references/review-criteria.md).
- Record or append findings in `docs/specs/{feature}/reviews/`, using the template's `Triage` and `Status` fields.
- Fix every required issue in code, owned tests, or the minimum upstream dependency, then re-review the affected perspectives.
- Close the step only when all required Critical and Major findings are resolved and every verdict is `Approved`.

**Review only:** If the user asks for review without code changes, run Review and Triage only, leave open findings at `Needs Revision`, and stop.

## Workflow

### Create

1. Confirm current-repo scope with [Implementation Scope Guide](references/implementation-scope-guide.md).
2. If changing existing methods, run [Branch Audit Guide](references/branch-audit-guide.md).
3. Map the work with `platform/docs/testing.md` and the `Developer Verification Policy` from `design.md`.
4. Add or update internal tests and any minimal stubs needed to keep Step 3 tests buildable. Cover developer-only branches called out in the `Dev-Only Verification` table with the lightest local proof per the policy.
5. When the current repo owns the Internal API contract, add or extend the schema-validation contract test in `unit/controller/` per the rule in [Quality Bar](references/quality-bar.md). The test must load the slim Internal API OpenAPI YAML at runtime and validate request acceptance, response shape, status codes, per-response Internal Code Tables, and grouped error examples against it. If Step 3 already authored such a test, verify it satisfies the rule and keep it GREEN; if it does not, extend it.
6. Implement the repo's code against the spec-anchored baseline (`design.md` + slim OpenAPI). If implementation reveals that the baseline is wrong, stop and return to Step 2 (`sdd-design-and-contract`) review iteration before changing controller / service behavior in a way the baseline does not describe.
7. Make owned tests GREEN — service unit tests, owned Controller Web Tests including the schema-validation contract test, integration tests, and owned Step 3 assets.
8. Complete the **Review loop** for this implementation pass.

### Update

1. Read current code, owned tests, `requirements.md`, `design.md`, and OpenAPI when they apply.
2. Preserve existing verified behavior unless the specification changed.
3. Update only tests and code owned by the current repo.
4. Re-run branch audit when modifying existing methods.
5. If the change requires the implementation to drift from the current `design.md` or slim OpenAPI baseline, stop. Return to `sdd-design-and-contract` (Step 2) review iteration first; once the Step 2 record is back to `Approved`, resume Step 4 against the updated baseline.
6. Re-run the schema-validation contract test after every controller / handler / mapper change. A red schema-validation test is a hard stop until either implementation or Step 2 is fixed (see [Quality Bar](references/quality-bar.md) -> Schema-validation triage).
7. When ownership, contract behavior, or test layering changes, complete the **Review loop** again (update the existing review file with a new iteration).

## Outputs

For Java/Spring repos, create or update only the current repo's Step 4 packages:

- `unit/service/`
- `integration/service/`
- `unit/controller/` — extend or add the schema-validation contract test artifact for repos that own the Internal API contract; the artifact lives in the existing Controller Web Test slot

Step 4 makes the current repo's local Step 3 tests GREEN. `scenario/e2e/` executes after staging deployment. Do not create new Step 3 assets here, but extending an owned Controller Web Test class with the schema-validation contract test is allowed and required when the rule in [Quality Bar](references/quality-bar.md) is not yet satisfied.
Other repo types keep the same ownership rules but use repo-local test layout.

## Rules

- Use [Quality Bar](references/quality-bar.md) as the common Step 4 quality bar. This skill adds only normal-input constraints.
- Confirm current-repo scope with [Implementation Scope Guide](references/implementation-scope-guide.md) before editing code or tests.
- Ajax or Batch repos can start Step 4 once the upstream contracts they depend on are fixed and their own Step 2 OpenAPI ownership and Step 3 inputs are ready.
- Add or update only the minimal stubs needed to keep owned Step 3 assets buildable before implementation is complete.
- Cover the developer-only branches listed in `design.md` `Dev-Only Verification` with the lightest local proof per the `Local Proof Selection Rule`.
- **Spec-anchored implementation.** Implementation may not silently change behavior described in `design.md` or the slim Internal API OpenAPI. If a defect or technical reality requires a contract or canonical-flow change, stop Step 4 and return to `sdd-design-and-contract` (Step 2) review iteration; resume Step 4 only after the Step 2 record is back to `Approved`.
- **Schema-validation contract test is mandatory** for every repo that owns the Internal API contract. The test loads the slim Internal API OpenAPI YAML at runtime and validates request acceptance, response shape, status codes, per-response Internal Code Tables, and grouped error examples against it. It lives in the existing Controller Web Test slot (`unit/controller/`) and must be GREEN before Step 4 closes. The full rule, the per-test acceptance criteria, and the failure-triage paths live in [Quality Bar](references/quality-bar.md); never silence the test, never weaken the assertions, never bypass the rule via test-only patches.

## Checklist

- [ ] The common Step 4 quality bar in [Quality Bar](references/quality-bar.md) is satisfied
- [ ] `requirements.md`, `design.md`, and owned Step 2 OpenAPI / Step 3 inputs are ready before Step 4 begins
- [ ] Current repo scope is confirmed before editing code or tests
- [ ] Minimal stubs keep owned Step 3 assets buildable without broad speculative implementation
- [ ] `Developer Verification Policy` branches owned by this repo are covered with the appropriate local proof
- [ ] Implementation has not silently drifted from `design.md` or slim OpenAPI; any baseline change went through a Step 2 review iteration
- [ ] When this repo owns the Internal API contract, the schema-validation contract test in `unit/controller/` exists, loads the OpenAPI YAML at runtime, validates request / response / status codes / grouped error examples, and is GREEN
- [ ] Affected current-repo test suite is GREEN
- [ ] Review loop is complete: triage recorded, fixes applied for all required Critical and Major findings, re-review done, record saved in `docs/specs/{feature}/reviews/`

## References

- [Quality Bar](references/quality-bar.md)
- [Implementation Scope Guide](references/implementation-scope-guide.md)
- [Branch Audit Guide](references/branch-audit-guide.md)
- [Review Criteria](references/review-criteria.md)
- `platform/docs/sdd-process.md`
- `platform/docs/testing.md`
