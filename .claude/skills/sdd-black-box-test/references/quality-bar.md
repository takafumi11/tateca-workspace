# Step 3 Quality Bar

This quality bar applies to both normal and reverse Step 3 work.
The execution expectation differs by mode, but the finished Step 3 assets should meet the same ownership and black-box coverage standard.

## Common Rules

- Keep one canonical AC set in `requirements.md`.
- Use `design.md` to decide `Test owner`, `Verification entrypoint`, and the canonical `QA E2E Matrix` and `QA Contract E2E Matrix` rows that QA owns.
- Draft only the current repo's owned Step 3 assets.
- Do not duplicate business AC verification across repos.
- Put each owned AC case once in `scenarios/` or the repo-local shared-case location.
- Keep one shared scenario set across local and staging executors.
- `scenario/testcontainers/` and `scenario/e2e/` should execute the same owned shared-case set where applicable.
- Executor helper implementations must not silently no-op for claimed verification. If one executor cannot yet perform a shared assertion, document the gap explicitly instead of counting that executor as evidence.
- Own Controller Web Tests only when the current repo owns the Internal API contract.
- Scenario and E2E executors must use the `Verification entrypoint` from `design.md`.
- Assert observable consumer-visible behavior such as visible states, async completion, polling, or idempotent duplicate-submission behavior where relevant.
- Respect cross-layer responsibility boundaries. Frontend UI tests are out of scope.
- For non-Java repos, use repo-local test layout but keep the same ownership and entrypoint rules.

## Common Checklist

- [ ] Ownership is explicit for every drafted test
- [ ] Business AC verification is not duplicated across repos
- [ ] Owned AC cases are defined once in `scenarios/` or the repo-local shared-case location
- [ ] `scenario/testcontainers/` and `scenario/e2e/` execute the same owned shared-case set where applicable
- [ ] Executor helper implementations either perform the claimed shared assertions or explicitly document any temporary verification gap
- [ ] Controller Web Tests cover the owned OpenAPI contract surface where applicable
- [ ] Scenario and E2E entrypoints match `design.md`
- [ ] Consumer-visible async behavior is asserted where relevant
- [ ] Cross-layer responsibility boundaries are respected
- [ ] Shared cases, executors, and Controller Web Tests stay aligned to the same owned Step 4 surface
