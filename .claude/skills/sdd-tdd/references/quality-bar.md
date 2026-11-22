# Step 4 Quality Bar

This quality bar applies to both normal and reverse Step 4 work.
The implementation expectation differs by mode, but the finished Step 4 code and internal tests should meet the same ownership and test-layering standard.

## Common Rules

- Implement or protect only the current repo's responsibilities.
- Team ownership does not collapse Step 4 across repos.
- Supporting repos test their own local logic without duplicating another repo's business verification.
- Keep Step 4 focused on internal logic and infrastructure behavior owned by the current repo.
- When existing methods or behavior branches are touched, run a branch audit and close missing coverage intentionally.
- Service unit tests cover branch logic and collaboration behavior, not HTTP status codes or full scenarios.
- Integration tests cover only behavior that needs real infrastructure.
- If the repo owns Controller Web Tests, keep them GREEN through controller or handler changes. Otherwise skip that phase.
- Keep contract adherence explicit where owned Step 2 OpenAPI or owned Step 3 assets apply.
- Owned Step 3 assets must be GREEN or explicitly not applicable before Step 4 closes.
- Cover developer-only branches listed in `design.md` `Dev-Only Verification` with the lightest local proof per the `Local Proof Selection Rule`.
- Do not mix frontend implementation into Step 4.
- For non-Java repos, use repo-local test layout but keep the same ownership and layering rules.
- **Spec-anchored implementation.** Step 4 implementation may not silently change behavior described in `design.md` or the slim Internal API OpenAPI surface. Any required deviation must go through a Step 2 review iteration in `sdd-design-and-contract` first; Step 4 resumes only after the Step 2 record is back to `Approved`. This rule applies to both normal and reverse Step 4 work — reverse Step 4 must not push code-shaped facts back into the reverse Step 2 baseline silently either; the same review-iteration handshake applies.
- **Schema-validation contract test is mandatory** for every repo that owns the Internal API contract. The artifact lives in the existing Controller Web Test slot (`unit/controller/` for Java/Spring; equivalent slot in other repo types) and must satisfy all of the following:
  - **Loads the slim Internal API OpenAPI YAML at test time.** Paths, schemas, and status codes are not duplicated as constants in the test code; the YAML is the source of truth.
  - **Validates request schema enforcement.** At least one valid request example is accepted and produces the documented success status. Every `400`-class example file under `components/examples/errors/` triggers the documented status and `errorCode`.
  - **Validates response schema conformance.** Every actual response is validated against the response schema referenced by the YAML. Extra fields, missing required fields, wrong types, or wrong status must fail the test.
  - **Validates the per-response Internal Code Table.** Every internal error code listed in a non-2xx response's `Internal code | Message` table must be reachable through at least one path; every produced error body must match `components/schemas/errors/{Feature}ApiErrorResponse.yaml`.
  - **Validates grouped error examples.** Every example file referenced under `components/examples/errors/` must be a structurally valid response under the response schema. Drift between an example file and the schema must fail the test, not be discovered downstream.
  - **Runs with the service layer mocked** (no real DB, no real external dependency). Implementation library is repo-local; the rule does not prescribe one. Real DB / external behavior remains in Integration / Scenario tests.
  - **Is GREEN in CI before Step 4 closes.**
- A red schema-validation contract test is a hard stop. Triage paths:
  - Implementation drifted from contract -> fix the implementation; the contract is the baseline.
  - Contract drifted from intended behavior -> stop Step 4 and return to `sdd-design-and-contract` (Step 2) review iteration; resume Step 4 once the Step 2 record is back to `Approved`.
  - Example file drifted from response schema -> fix the example file (or the schema, under a Step 2 iteration if the schema itself is wrong).
  - Internal Code Table lists a code that no path produces -> either remove the code under a Step 2 iteration, or fix the implementation path that should produce it.
  Never silence the test, weaken assertions, or hardcode paths to make it pass.

## Common Checklist

- [ ] Current repo scope is explicit
- [ ] Branch audit is complete when existing methods or behavior branches changed
- [ ] Unit tests cover the changed or newly protected branch logic
- [ ] Owned Controller Web Tests are GREEN when applicable
- [ ] Integration tests cover only real-infrastructure behavior
- [ ] Business-flow verification is not duplicated across Step 3 and Step 4 layers
- [ ] Owned Step 3 assets are GREEN or explicitly not applicable
- [ ] Developer-only branches from `design.md` `Dev-Only Verification` are covered with appropriate local proof
- [ ] Implementation has not silently drifted from `design.md` or slim OpenAPI; any baseline change went through a Step 2 review iteration recorded in `docs/specs/{feature}/reviews/`
- [ ] When this repo owns the Internal API contract, the schema-validation contract test exists in `unit/controller/`, loads OpenAPI YAML at runtime, validates request / response / status / grouped error examples, and is GREEN
- [ ] No frontend-team work is mixed in
- [ ] Affected current-repo test suite is GREEN
