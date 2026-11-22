# Implementation Scope Guide

Step 4 ownership is per repo with code changes.
Team ownership does not merge implementation work across repos.
Java/Spring package names in this skill are examples for Java repos. Other repo types keep the same ownership boundary with local conventions.

## Typical Scope

| Repo type | Usually owns in Step 4 | Excludes |
|-----------|-------------------------|----------|
| Internal API | service logic, persistence, external-service clients, internal controllers or batch endpoints | frontend UI, Ajax-only view shaping |
| Ajax implementation | request or response mapping, auth-surface handling, controller or handler wiring, downstream client integration | frontend UI, Internal API business-state truth |
| Batch | jobs, orchestration, rerun or retry logic, batch persistence | Ajax shaping, other repos' business logic |
| Airflow or scheduler repo | scheduler code changed in that repo | Batch or Internal API logic owned elsewhere |

## Step 3 Interplay

- Downstream repos such as Ajax can start once the upstream contracts they depend on are fixed.
- If the repo owns Scenario, Controller Web, or E2E tests, they must exist before implementation.
- If the repo owns no Step 3 assets but still has code changes, Step 4 can proceed with internal tests only.

Skip Step 4 when the feature introduces no code changes in the current repo.
