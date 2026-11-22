# Agent Instructions

This file is the source of truth for agent behavior in this repository. `README.md` is the human-facing overview.

`tateca-workspace` holds Tateca's product-level sources of truth: requirements with acceptance criteria (AC), the API contract, temporary plans, and agent skills. Implementation lives in the sibling repositories.

Read `product/overview.md` at the start of a session before doing Tateca work.

## Repositories

All Tateca repositories sit side by side in one parent directory. Reach them from here as `../<name>`. If a repository you need is missing, stop and ask the developer to clone it there; do not guess another path.

| Repository | Role |
|---|---|
| `tateca-workspace` | This repository |
| `tateca-backend` | REST API. Java / Spring Boot today, migrating to Go (`plans/go-migration.md`) |
| `tateca-web` | Next.js. LP and read-only web view on tateca.net |
| `tateca-ios` | SwiftUI iOS app, the main client |
| `tateca-infrastructure` | AWS CDK. Lambda for the daily exchange-rate update and the API keep-alive |
| `tateca-config` | Public app config for iOS (`config.tateca.net` on Cloudflare; legacy config on Firebase Hosting) |

System facts that cross repositories:

- API: production `https://api.tateca.net`, staging `https://staging-api.tateca.net`, docs `https://docs.tateca.net`.
- Authentication: `/internal/**` uses the `X-API-Key` header (called by Lambda). Every other path uses a Firebase ID token.

## Where Things Live

| Path | Owns |
|---|---|
| `product/overview.md` | What Tateca is, the domain model, cross-domain terms |
| `product/requirements/{domain}.md` | Requirements and ACs for one domain. The agreed source of truth for behavior |
| `contracts/`, `openapi.yaml` | API contract and the source of `docs.tateca.net` |
| `plans/` | Plans for work in progress. Delete a plan when its work lands |
| `.claude/skills/` | Agent skills for this project |

## Sources of Truth

- `product/requirements/` is what was agreed. When requirements, tests, and code disagree, align them to the requirements. Changing the requirements needs PdM approval.
- Tests prove each AC by carrying its ID (`{domain} R{n}-AC{m}`, for example `group R2-AC9`). A CI check compares the IDs tests verified with the IDs in `product/requirements/`, in both directions.
- Code is the source of truth for details no AC decides.
- Reasons for technical choices go in the PR description and commits. Record a hard-to-reverse decision as an ADR in `decisions/`, creating the directory when the first one is needed.
- Do not write design docs, task lists, or review-record files.

## How to Work

- Requirements: use the `sdd-requirements` skill to create, update, review, or draft requirements from current behavior.
- Implementation, investigation, bug fixes, and refactoring: use pstack (`/pstack:poteto-mode`) in the implementation repository.
- For a new feature or a behavior change: requirements first (PdM approval), then the API contract if it changes, then black-box tests that carry the AC IDs and fail first, then the implementation, then verification on the running app, then the PR.
- Human gates: requirements changes (PdM), API contract changes (old iOS app versions keep calling the API, so a contract change is effectively irreversible), and merges.

The move from the old SDD process to this flow is in progress; see `plans/dev-flow.md`.
