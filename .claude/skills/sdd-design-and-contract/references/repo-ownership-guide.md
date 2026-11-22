# Repo Ownership Guide

Keep ACs canonical in `requirements.md`. Use `design.md` to assign ownership.

## Required Table

```md
## AC Ownership Matrix

| Requirement / AC | Business trigger | Primary owner repo | Supporting repo(s) | Verification entrypoint | Contract / interface | Test owner |
|------------------|------------------|--------------------|--------------------|-------------------------|----------------------|------------|
| R1-AC1 | {trigger} | {repo} | {repo(s)} | {entrypoint} | {interface} | {repo} |
```

## Column Meaning

- `Requirement / AC`: AC ID from `requirements.md`
- `Business trigger`: event that starts the behavior
- `Primary owner repo`: repo that realizes the outcome
- `Supporting repo(s)`: repos that enable or orchestrate it
- `Verification entrypoint`: surface used for primary Scenario or E2E verification
- `Contract / interface`: boundary that must exist (Internal API path, batch endpoint, external integration)
- `Test owner`: repo that owns primary business verification

## Rules

- Assign one `Primary owner repo` per AC.
- `Test owner` is usually the same repo.
- Do not rely on implicit single-repo assumptions. Even simple changes must name the current repo explicitly in `Primary owner repo`, `Verification entrypoint`, and `Test owner`.
- Team ownership does not remove repo boundaries.
- In this repository, the OpenAPI half of Step 2 exists only for the Internal API contract.
- Supporting repos test their own orchestration or contract behavior only.
- When multiple repos participate, make each repo's responsibility derivable from the matrix and surrounding flow. Do not leave supporting roles implicit.
- If the outcome is visible only from the Internal API boundary, that repo usually owns primary verification.
- If Batch has distinct operator-visible behavior, it may justify separate Batch-owned ACs.
- If another repo depends on the Internal API contract, fix the OpenAPI half of Step 2 in the owning repo first. Then the downstream repo can continue in its own repository against that dependency.

## Frontend Handoff

If frontend depends on backend semantics, add `Consumer Interaction Notes` for:

- visible backend states
- sync vs async completion
- refresh or polling expectation
- canonical state surface
- idempotency and duplicate-submission behavior

Do not include UI layout, component structure, CSS, copy, or client-state design.
