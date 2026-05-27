# Agent Instructions for Codex and Cursor

Use this file as the source of truth for shared agent behavior in this repository. `README.md` is the human-facing overview.

This repository is the Tateca AI-agent-first SDD workspace. SDD プロセス、フィーチャー仕様、OpenAPI 契約、API Docs 生成/公開をここで管理する。実装は `tateca-backend` に残す。

## Required Domain Context

- Read `docs/STEERING.md` at the start of the session before doing Tateca work in this repository.

## Working Context

- Open this repository directly in the editor when working on SDD, specs, or the API contract.
- Use repository-root-relative paths unless a document explicitly says otherwise.
- Main areas of the repository:
  - `docs/`: SDD process docs, testing strategy, templates
  - `docs/specs/{feature}/`: feature requirements and design
  - `contracts/`: Tateca API Contract source files (paths, components, info)
  - `openapi.yaml`: API Contract entry point
  - `scripts/`: local docs build helpers

## Key Entry Points

- `docs/STEERING.md`: project overview
- `docs/sdd-process.md`: normal SDD process
- `docs/sdd-reverse-process.md`: reverse SDD process
- `docs/testing.md`: shared test-type strategy
- `docs/agent-skill-guide.md`: doc / skill maintenance guidance

## Cross-Repo Work

- Implementation lives in `tateca-backend`. Machine-specific checkout paths live in `LOCAL_REPOSITORY_LINKS.md`, which is local-only and gitignored.
- If cross-repo implementation or investigation is needed, read `LOCAL_REPOSITORY_LINKS.md` first.
- If `LOCAL_REPOSITORY_LINKS.md` is missing or any required path is `TBU`, stop and ask the developer to update it instead of guessing local paths.
