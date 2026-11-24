---
name: tateca-mode
description: Tateca's working mode, layered on pstack's poteto-mode. Use when the user types /tateca-mode or asks to work on Tateca (tateca-backend, tateca-web, tateca-ios, tateca-workspace) the Tateca way.
disable-model-invocation: true
---

# Tateca mode

Work as poteto-mode does, plus the rules below. Where they conflict, these rules win.

## Start

1. Read pstack's poteto-mode in full and follow it: the newest `~/.claude/plugins/cache/cursor-plugins/pstack/*/skills/poteto-mode/SKILL.md`, and the Claude Code adapter it names. Pick the playbook it would pick.
2. Read `tateca-workspace/AGENTS.md` and `tateca-workspace/product/overview.md`. Reach the other repositories as siblings (`../tateca-backend`, `../tateca-web`, `../tateca-ios`, `../tateca-infrastructure`, `../tateca-config`). If one is missing, stop and ask.
3. While `tateca-workspace/plans/go-migration.md` exists, its migration rules apply to `tateca-backend`.

## Sources of truth

- `tateca-workspace/product/requirements/{domain}.md` is what was agreed. Align tests and code to it. Change it only with the `sdd-requirements` skill and PdM approval.
- Tests prove an AC by carrying its ID (`{domain} R{n}-AC{m}`). Code decides only what no AC decides.
- The API shape and each endpoint's errors live in backend code: handler types and the error declaration next to each handler. Do not hand-write OpenAPI.
- Put reasons in the PR and commits. Do not write design docs, task lists, or review files. Work that spans PRs gets a plan in `tateca-workspace/plans/`; delete it when the work lands.

## Changes to poteto-mode's playbooks

- **Feature or behavior change.** Before implementing: the requirements are updated and the PdM approved them (if not, stop and ask). Write black-box tests for each new or changed AC, carrying its ID, and watch them fail for the right reason. Then implement until they pass. poteto-mode's "test only when cheap" does not apply to AC tests. Finish by verifying on the running app with the repository's verify skill.
- **Existing behavior with no AC.** Pin the current behavior with characterization tests first. Then ask the human to sort each observed behavior: intended (becomes an AC through `sdd-requirements`), incidental (stays pinned, no AC), or bug (an issue).
- **Bug fix.** As poteto-mode. If the bug shows a missing AC, ask the PdM whether to add one.
- **Black-box tests** assert only what clients observe through the API. Never read the database in an assertion; seeding reference data in setup is fine.
- **Errors.** An endpoint returns only the error codes declared next to its handler. Keep the declared codes and the codes tests observe equal, in both directions.
- **Coverage.** Where the repository measures black-box coverage, give every uncovered branch a test or a written reason.

## Human gates

Stop and ask before:

- changing requirements or ACs;
- changing a response shape or the errors an endpoint returns (old iOS app versions keep calling the API, so treat such a change as irreversible);
- merging a PR whose merge deploys: its CD changes the API server, cloud resources, or app config. Today that is every PR in `tateca-infrastructure` and `tateca-config`, and a `tateca-backend` PR that changes any file its CD does not skip (`paths-ignore` in `.github/workflows/cd.yml`; without one, CD redeploys Railway on every push to `main`).

## Merging

Merge every other PR yourself through poteto-mode's Shipping playbook. A PR merges when an agent that did not write its code verified its current head and posted `PASS` or `PASS+NOTES` on it, CI is green at that head, and its human gates are cleared (a requirements PR needs the PdM's approval). Keep cross-repository order: merge a requirements PR before the backend PR whose AC check reads it. Use the merge method the repository already uses, and read the PR back to confirm it merged.

## Git and GitHub

- Branch from `origin/main` and unset the new branch's upstream, so a bare `git push` cannot reach `main`.
- Push your own branches without asking. Never push to `main`. Follow any local push rules in `~/.claude/rules/`.
