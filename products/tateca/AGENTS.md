# Tateca — agent notes

This directory is the Tateca product workspace (specs, contracts, local docs tooling).

## Layout

- `docs/specs/{feature}/requirements.md` — domain ACs
- `docs/specs/{feature}/design.md` — high-level design when present
- `contracts/internal-api/` — Tateca API Contract (OpenAPI)
- `scripts/` — local docs build helpers
- `generated/` — build output only; do not commit

## Rules

- Commit `package.json` / `package-lock.json` when dependencies change.
- Do not commit `generated/`. It is produced by `npm run build` (and CI).
- Frontend SDD extension rules: `platform/docs/frontend-sdd.md`
- Frontend test policy: `platform/docs/frontend-testing.md`

## Doc build

Typical local flow: `npm ci` in this directory, then `npm run lint`, `npm run build`, and `npm run preview`.

OpenAPI source of truth lives under `contracts/internal-api/`.

## Cross-repo implementation

Step 5 implementation and backend tests live in `tateca-backend`. Read `LOCAL_REPOSITORY_LINKS.md` at the workspace root before opening that repository.
