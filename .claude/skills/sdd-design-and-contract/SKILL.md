---
name: sdd-design-and-contract
description: Creates or updates the merged Step 2 in normal SDD. Produces both `design.md` (HLD narrative + canonical testable flows + QA / developer verification matrices + assertion rules) and the slim Internal API OpenAPI surface (paths, schemas, status codes, grouped error examples, short Business Rules) as one coordinated artifact pair. Use when the user needs Step 2 design or contract changes — flow design, AC Ownership Matrix, verification entrypoint, integration patterns, recovery routing, data-model decisions, OpenAPI path / schema / error mapping, or response-grouped error examples — after Step 1 requirements are fixed. Not for Step 1 business requirements, Step 3+ tests, or reverse SDD.
---

# SDD Design + Contract

Step 2 is one merged step that produces two coordinated artifacts:

1. **`design.md`** — the HLD narrative source of truth. It includes processing flows with explicit DB and KVS side effects per node, state transitions, repo ownership, integration patterns and external-dependency tables, recovery routing, data-model decisions, the QA E2E matrix, the developer verification policy, and assertion rules used by test authors. Step 3 and Step 4 ownership routing is derived from here.
2. **Internal API OpenAPI** — the slim contract surface. It contains only paths, request and response schemas, validation rules, status codes, and grouped error examples per HTTP status. The description block carries only a short Business Rules summary and a short Dependencies one-liner. Flow diagrams, Saga step prose, KVS update prose, `external_ref_key` rules, AC ownership matrices, and any other narrative belong in `design.md`.

Keep business rules in `requirements.md`, HLD narrative and ownership in `design.md`, slim contract detail in OpenAPI, and implementation detail in code.
Step 2 is mandatory for every feature or AC change because repo ownership, verification entrypoint, contract boundaries, and contract-visible error mapping must stay explicit.
Use the execution context from the active process doc; `current repo` means the repository where this step's code and tests live (see root `LOCAL_REPOSITORY_LINKS.md` for local microservice paths).

## Route

| Step 2 file state (after process selection) | Internal API ownership | Route |
|---------------------------------------------|------------------------|-------|
| `design.md` missing | Any | Create `design.md`; create or update OpenAPI only when this repo owns the contract |
| `design.md` exists, OpenAPI not owned by current repo | No | Update `design.md` only; reference the owning repo's contract as a dependency |
| `design.md` exists, OpenAPI owned, contract changes | Yes | Update both `design.md` and OpenAPI |
| `design.md` exists, OpenAPI owned, no contract change | Yes | Update `design.md` only |

When the current repo does not own the Internal API contract, the OpenAPI half of Step 2 is delegated to the owning repo and must be referenced as a contract dependency in `design.md`.

## Before Working

1. Read repository root `LOCAL_REPOSITORY_LINKS.md` when Step 2 ownership spans repos you must verify locally; if missing or paths are `TBU`, stop and ask the developer to update it (copy from `LOCAL_REPOSITORY_LINKS.template.md`).
2. Read `platform/docs/sdd-process.md`.
3. Read [Quality Bar](references/quality-bar.md).
4. Read `platform/docs/testing.md` only for OpenAPI vs Controller Web boundaries.
5. Verify `docs/specs/{feature}/requirements.md` is finalized.
6. Read `docs/ADR.md` if it exists.
7. Use [Design Guide](references/design-guide.md) for the canonical `design.md` structure.
8. Use [Repo Ownership Guide](references/repo-ownership-guide.md) for the `AC Ownership Matrix`.
9. Use [Contract Scope Guide](references/contract-scope-guide.md) and [Mapping Guide](references/mapping-guide.md) for the OpenAPI half.

If Step 1 is not finalized, stop and fix Step 1 first. If the contract surface should belong to another repo, route the OpenAPI half there.

## Review loop

Complete **Review -> Triage -> Fix -> Re-review** using `platform/docs/review-record-template.md`.

- Run the common Step 2 checklist in [Quality Bar](references/quality-bar.md), this skill's addendum checklist, and every perspective in [Review Criteria](references/review-criteria.md).
- The review covers both halves at once: `design.md` narrative + canonical flows + QA / developer matrices + assertion rules **and** the slim OpenAPI contract surface (paths, schemas, status codes, grouped error examples).
- Record or append findings in `docs/specs/{feature}/reviews/`, using the template's `Triage` and `Status` fields.
- Fix every required issue in `design.md`, OpenAPI, or the minimum upstream dependency, then re-review the affected perspectives.
- Close the step only when all required Critical and Major findings are resolved and every verdict is `Approved`.

**Review only:** If the user asks for review without edits, run Review and Triage only, leave open findings at `Needs Revision`, and stop.

## Workflow

### Create

1. Extract architecture decisions from `requirements.md`.
2. Draft `design.md` using [Design Guide](references/design-guide.md):
   - `AC Ownership Matrix` per [Repo Ownership Guide](references/repo-ownership-guide.md)
   - `Consumer Interaction Notes` only when frontend handoff depends on backend semantics
   - `Canonical Testable Flows` (one Mermaid flowchart per major path — request, recovery, etc.) where intermediate side-effect nodes state what changes in DB, what changes in KVS, and what is unchanged, and HTTP status codes / final response shapes appear only on terminal response nodes (one terminal per distinct response variant). Branch on persistence pre-state when product behavior diverges per pre-state. State conditional best-effort writes in node text. Precede each `flowchart TD` with the convention banner. Non-gates intentionally dropped from previous behavior are named in plain text
   - `External Integration Flows` (one section per external dependency, with a small fact table and a Mermaid mapping diagram)
   - External error / outcome mapping snapshot table when external dependencies have non-trivial branches
   - `Assertion Rules For Test Authors` listing the rules tests must enforce (DB, KVS, history rows, idempotency including external-dependency idempotent confirmation, finalization order, external-to-internal error conversion, post-success rollback, versioned-row trajectory)
   - `QA E2E Matrix` and contract sub-suite (the QA self-service surface)
   - `Developer Verification Policy` covering shared scenario mirroring and the dev-only verification table
   - Data-model decisions
   - Walk through the `QA Question Prevention Heuristic` in [Design Guide](references/design-guide.md) and confirm every applicable row is answered in plain text before closing the draft
3. If the current repo owns the Internal API contract, draft or update OpenAPI using [Contract Scope Guide](references/contract-scope-guide.md) and [Mapping Guide](references/mapping-guide.md):
   - Path operation, parameters, request and response schemas
   - Validation rules in schemas
   - One success response and one response per HTTP status code; each non-2xx response `description:` carries a small `Internal code | Message` table covering every internal code that maps to that HTTP status, plus **grouped error examples** (one example per `(HTTP status, internal error code)` pair, or per scenario when one code maps to multiple field-level scenarios)
   - Short Business Rules summary in the description (no narrative duplication from `design.md`)
   - Short Dependencies one-liner only when callers need to know the external system list
4. Cross-link: `design.md` references the owned OpenAPI path file when it owns the contract; OpenAPI's Business Rules summary references AC IDs from `requirements.md` and the `Canonical Testable Flows` section in `design.md`.
5. Complete the **Review loop** for both halves in one record.

### Update

1. Read the current `design.md`, current OpenAPI, `requirements.md`, and applicable ADRs.
2. Decide whether the change is narrative-only (`design.md` only), contract-only (OpenAPI only), or both. When in doubt, update `design.md` first because OpenAPI mirrors the narrative.
3. Keep repo ownership, verification entrypoint, contract boundaries, and contract-visible error mapping explicit even when the delta is small.
4. If Step 1 intentionally omits field names or technical terms, make the matching half of Step 2 own those mappings explicitly: field-level validation in OpenAPI; flow-level mappings, persisted-value rules, and side-effect grouping in `design.md`.
5. Preserve compatibility for already-released contract behavior unless an approved breaking change exists.
6. Update only the affected sections; preserve validated decisions unless requirements or constraints force a change.
7. When architecture behavior, ownership, or contract-visible semantics change, complete the **Review loop** again (update the existing review file with a new iteration covering both halves).

## Outputs

For every owned feature in this repository:

- `products/<product>/docs/specs/{feature}/design.md` — narrative half (always required)
- `products/<product>/contracts/internal-api/paths/{feature}.yaml` plus referenced schemas and error examples — contract half, only when this repo owns the Internal API surface

## Rules

- Use [Quality Bar](references/quality-bar.md) as the common Step 2 quality bar. This skill adds only normal-input constraints.
- Keep repo ownership, verification entrypoint, and contract boundaries explicit even when the HLD delta is small.
- Make `design.md` sufficient for QA to write E2E tests without reverse-engineering service code; every major flow node must say what changes in DB, what changes in KVS, and what remains unchanged.
- Make non-gates explicit. If the previous spec performed a check that this spec intentionally drops, name the absence in plain text instead of relying on the absence of a flow node.
- Make external-to-internal error conversion explicit. When several internal causes (optimistic lock, deadlock, integrity violation, etc.) collapse into one external code, state the conversion rule in `Assertion Rules For Test Authors`: name the external code, enumerate the internal causes in plain text, and confirm the response body never carries the internal cause.
- Make post-success rollback explicit. When finalization can fail after an external `2xx`, name the persisted state and the response in `Assertion Rules For Test Authors` (typically "stays `RECOVERABLE`, returns `200`").
- Use a contiguous scenario-ID namespace per feature. QA-owned concrete scenarios occupy `S01..Sn` in `QA E2E Matrix`; dev-owned concrete scenarios continue with `Sn+1..Sm` in `Dev-Only Verification`. Do not reserve future slots, do not skip numbers, and do not use suffixed sub-IDs (`S09a`, `S09b`). Coverage rules in Dev-Only Verification carry `—` in the `Scenario ID` column. See `Scenario ID Convention` in [Design Guide](references/design-guide.md).
- Walk through the `QA Question Prevention Heuristic` in [Design Guide](references/design-guide.md) before closing the draft and confirm every applicable row is answered in plain text.
- Keep OpenAPI strictly contract-focused. Paths, schemas, status codes, validation, per-response Internal Code Tables, grouped error examples, short Business Rules, and short Dependencies are the only allowed top-level content. Move every other narrative to `design.md` and link by AC ID or section name.
- Each non-2xx response `description:` lists every internal error code that maps to that HTTP status as a small `Internal code | Message` markdown table. The top-level "Error Code List" table is forbidden.
- Group error examples per HTTP status: each `(HTTP status, internal error code)` pair gets its own named example referencing a separate `components/examples/errors/*.yaml` file.
- Preserve validated design decisions and released contract behavior unless requirements or approved breaking changes force a change.

## Checklist

- [ ] The common Step 2 quality bar in [Quality Bar](references/quality-bar.md) is satisfied
- [ ] `requirements.md` is finalized before Step 2 drafting begins
- [ ] ADR constraints were incorporated when applicable
- [ ] Small deltas still keep ownership, verification entrypoint, and contract boundaries explicit
- [ ] `design.md` includes `AC Ownership Matrix`, `Canonical Testable Flows` with DB / KVS side effects per node, explicit non-gates, `External Integration Flows`, `External Outcome Mapping Snapshot` (when applicable), `Assertion Rules For Test Authors` covering external-to-internal error conversion / post-success rollback / versioned-row trajectory, `QA E2E Matrix`, and `Developer Verification Policy`
- [ ] Scenario IDs follow the contiguous-namespace convention: QA owns `S01..Sn`, dev owns `Sn+1..Sm`, no gaps, no `S##a`/`S##b` sub-IDs, coverage rules carry `—` in the Dev-Only Verification `Scenario ID` column
- [ ] `QA Question Prevention Heuristic` walkthrough is complete and every applicable row is answered in plain text
- [ ] OpenAPI carries only paths, schemas, status codes, per-response Internal Code Tables, grouped error examples, short Business Rules, and short Dependencies; no flow diagrams, Saga prose, KVS prose, or `external_ref_key` rules remain in OpenAPI
- [ ] Each non-2xx response `description:` carries the per-response `Internal code | Message` table
- [ ] Each owned `(HTTP status, internal error code)` pair has its own grouped example
- [ ] OpenAPI Business Rules summary references AC IDs and `design.md` sections instead of restating them
- [ ] Compatibility impact for the contract surface is preserved or explicitly called out
- [ ] Review loop is complete: triage recorded, fixes applied for all required Critical and Major findings, re-review done, record saved in `docs/specs/{feature}/reviews/`

## References

- [Quality Bar](references/quality-bar.md)
- [Design Guide](references/design-guide.md)
- [Repo Ownership Guide](references/repo-ownership-guide.md)
- [Contract Scope Guide](references/contract-scope-guide.md)
- [Mapping Guide](references/mapping-guide.md)
- [Review Criteria](references/review-criteria.md)
- `platform/docs/sdd-process.md`
- `platform/docs/testing.md`
