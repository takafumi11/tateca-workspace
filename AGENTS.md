# Agent Instructions for Codex and Cursor

Use this file as the source of truth for shared agent behavior in this repository. `README.md` is the human-facing overview.

This repository is the shared AI-agent-first SDD workspace for Tateca.

## Required Domain Context

- Read `platform/docs/STEERING.md` at the start of the session before doing Tateca work in this repository.
- Treat `platform/docs/STEERING.md` as Tateca-wide background context for specs and contracts.
- Product-specific guidance lives under `products/tateca/AGENTS.md` and related docs.

## Working Context

- Open this repository directly in the editor when working on SDD, specs, or API contracts.
- Use repository-root-relative paths unless a document explicitly says otherwise.
- Main areas of the repository:
  - `platform/docs/`: shared SDD process, reverse process, testing strategy, and templates
  - `products/tateca/docs/`: feature requirements and design
  - `products/tateca/contracts/internal-api/`: Tateca API Contract (OpenAPI)
  - `products/tateca/scripts/`: local docs build helpers

## Key Entry Points

- `platform/docs/sdd-process.md`: normal SDD process
- `platform/docs/sdd-reverse-process.md`: reverse SDD process
- `platform/docs/testing.md`: shared test-type strategy
- `platform/docs/agent-skill-guide.md`: doc / skill maintenance guidance
- `products/tateca/AGENTS.md`: Tateca product workspace rules

## Cross-Repo Work

- Implementation lives in `tateca-backend`. Machine-specific checkout paths live in `LOCAL_REPOSITORY_LINKS.md`, which is local-only and gitignored.
- If cross-repo implementation or investigation is needed, read `LOCAL_REPOSITORY_LINKS.md` first.
- If `LOCAL_REPOSITORY_LINKS.md` is missing or any required path is `TBU`, stop and ask the developer to update it instead of guessing local paths.
