---
name: sdd-reverse-design-and-contract
description: Reconstructs missing or materially incomplete Step 2 baseline (`design.md` HLD narrative + slim Internal API OpenAPI surface) for already-implemented behavior in reverse SDD. Use when reverse SDD is active, reverse Step 1 is available enough to anchor the design, and the current repo needs Step 2 ownership, AC Ownership Matrix, canonical testable flows with DB / KVS side effects, integration patterns, recovery routing, OpenAPI path / schema / status / grouped error examples, or QA / developer matrix backfill. Not for normal SDD changes.
---

# SDD Reverse Design + Contract

Step 2 in reverse SDD reconstructs **both halves at once** for the current repo's owned scope from already-implemented behavior:

1. **`design.md`** — HLD narrative source of truth: ownership matrix, canonical testable flows with DB and KVS side effects per node, integration patterns and external-dependency tables, recovery routing, state model, assertion rules for test authors, QA E2E matrix, QA contract matrix, developer verification policy, data-model decisions.
2. **Internal API OpenAPI** — slim contract surface for the owned Internal API only: paths, request and response schemas, validation rules, status codes, per-response `Internal code | Message` table inside each non-2xx `description:`, grouped error examples per HTTP status, short Business Rules summary, short Dependencies one-liner.

Use current code, existing docs, contracts, tests, and reverse Step 1 as evidence. Do not invent intended architecture or contract semantics.
Use the execution context from the active process doc; `current repo` means the repository where this step's code and tests live (see root `LOCAL_REPOSITORY_LINKS.md` for local microservice paths).

## Route

| Step 2 baseline state for the current repo's owned scope | Internal API ownership | Route |
|----------------------------------------------------------|------------------------|-------|
| `design.md` missing or materially incomplete | Any | Use this skill (rebuild `design.md`; rebuild OpenAPI only when this repo owns the contract) |
| `design.md` adequate, OpenAPI missing or stale and owned by current repo | Yes | Use this skill (rebuild OpenAPI half only) |
| `design.md` adequate, OpenAPI adequate or not owned | n/a | Skip |

## Before Working

1. Read repository root `LOCAL_REPOSITORY_LINKS.md` when Step 2 ownership spans repos you must verify locally; if missing or paths are `TBU`, stop and ask the developer to update it (copy from `LOCAL_REPOSITORY_LINKS.template.md`).
2. Read `platform/docs/sdd-reverse-process.md`.
3. Verify `docs/specs/{feature}/requirements.md` exists from the reverse pass.
4. Read `platform/skills/sdd-design-and-contract/references/quality-bar.md` as the common Step 2 quality bar.
5. Read `platform/skills/sdd-design-and-contract/references/design-guide.md`, `repo-ownership-guide.md`, `contract-scope-guide.md`, and `mapping-guide.md`.
6. Read `platform/docs/testing.md` only for OpenAPI vs Controller Web boundaries.
7. Read [Reconstruction Checks](references/reconstruction-checks.md).
8. Read current code, current OpenAPI, controller behavior, tests, ADRs, and persistence or interface evidence for the owned scope.

## Review loop

Complete **Review -> Triage -> Fix -> Re-review** using `platform/docs/review-record-template.md`.

- Run the common Step 2 checklist from `platform/skills/sdd-design-and-contract/references/quality-bar.md`, the reverse addendum checklist in this skill, every perspective in `platform/skills/sdd-design-and-contract/references/review-criteria.md`, and the shared reverse review additions in `platform/docs/sdd-reverse-process.md`.
- Cover both halves in one review record: narrative reconstruction in `design.md` and contract reconstruction in OpenAPI (when the current repo owns it).
- Record or append findings in `docs/specs/{feature}/reviews/`, using the template's `Triage` and `Status` fields.
- Fix every required issue in `design.md`, OpenAPI, or the minimum upstream reverse artifact, then re-review the affected perspectives.
- Close the step only when all required Critical and Major findings are resolved and every verdict is `Approved`.

**Review only:** If the user asks for review without edits, run Review and Triage only, leave open findings at `Needs Revision`, and stop.

## Workflow

### Create

1. Build a short evidence inventory from reverse Step 1, code, current OpenAPI, controller behavior, tests, ADRs, and persistence or interface evidence. Use sibling specs only as sanity checks for boundary or wording patterns.
2. Reconstruct `design.md`:
   - Extract only architecture decisions proven by current behavior. If evidence conflicts, surface the conflict instead of inventing an idealized design.
   - Add the `AC Ownership Matrix`, `Canonical Testable Flows` (intermediate side-effect nodes carry only DB / KVS side effects; HTTP status codes and final response shapes appear only on terminal response nodes; one terminal node per distinct response variant; persistence pre-state branched explicitly when product behavior diverges per pre-state; conditional best-effort writes stated as conditionals in the matching node text; convention banner above every `flowchart TD`), `External Integration Flows` per real dependency, `State Model`, `Assertion Rules For Test Authors`, `QA E2E Matrix`, `QA Contract E2E Matrix`, `Developer Verification Policy`, and `Data Model Decisions`.
   - Ground state, routing, persistence, and side-effect detail in current code and persistence evidence. Do not introduce new structural elements unless current behavior proves them.
   - Make downstream Step 3 and Step 4 ownership derivable without guesswork, including explicit manual-verification notes when automated verification is not the real verification path.
3. If the current repo owns the Internal API contract, reconstruct OpenAPI:
   - Confirm scope with `platform/skills/sdd-design-and-contract/references/contract-scope-guide.md`.
   - Map reconstructed `design.md` and reverse Step 1 into the slim contract with `platform/skills/sdd-design-and-contract/references/mapping-guide.md`: paths, schemas, status codes, per-response `Internal code | Message` table inside each non-2xx `description:`, grouped error examples per `(HTTP status, internal error code)` pair, short Business Rules summary that references AC IDs and `design.md` sections, short Dependencies one-liner.
   - Remove existing flow diagrams, Saga prose, KVS prose, `external_ref_key` rules, and the top-level "Error Code List" table from the operation description; relocate any still-relevant facts into `design.md`.
4. Run the reverse Step 2 hygiene pass in [Reconstruction Checks](references/reconstruction-checks.md).
5. Complete the **Review loop** for both halves in one record.

### Update

1. Read the current `design.md`, current OpenAPI, reverse Step 1, code, and contracts.
2. Preserve already-validated current-behavior decisions unless the earlier reverse inference was wrong.
3. Update only the missing or materially incomplete sections in `design.md` (and the matching slim OpenAPI surface when this repo owns it).
4. Re-run the reverse Step 2 hygiene pass when repo boundaries, state transitions, contract dependency order, persistence grounding, or contract-visible error mapping change.
5. Keep appending iterations to the same Step 2 reverse review file until the baseline is clean.

## Outputs

- `products/<product>/docs/specs/{feature}/design.md` — narrative half (always required when this skill runs)
- `products/<product>/contracts/internal-api/paths/{feature}.yaml` plus referenced schemas and grouped error examples — contract half, only when this repo owns the Internal API surface

## Rules

- Use `platform/skills/sdd-design-and-contract/references/quality-bar.md` as the common Step 2 quality bar. This skill adds only reverse-reconstruction constraints.
- Reverse current behavior; do not invent intended architecture or contract semantics.
- Ground state model, idempotency mechanism, persistence rules, and contract status / error mapping in current code, current persistence, and current controller behavior. Do not invent new structural elements unless current behavior proves them.
- If evidence conflicts or repo-boundary, ownership, persistence, or contract-routing drift cannot be resolved from current behavior, surface the drift explicitly instead of smoothing it over.
- Use sibling specs only as sanity checks for boundary patterns or vocabulary. They are not primary evidence.
- Do not use this skill for speculative improvements that belong to a later normal SDD pass.
- Reconstruct scenario IDs as a single contiguous namespace per feature: QA-owned concrete scenarios first (`{FEATURE-PREFIX}-S01..Sn`), dev-owned concrete scenarios after (`Sn+1..Sm`). When the existing design uses reserved gaps or `S##a`/`S##b` sub-IDs, renumber the affected range so the namespace stays contiguous and update every reference (test method names, source columns, prose). Coverage rules in Dev-Only Verification carry `—` in the `Scenario ID` column.

## Checklist

- [ ] The common Step 2 quality bar in `platform/skills/sdd-design-and-contract/references/quality-bar.md` is satisfied
- [ ] Reverse Step 1 exists and is sufficient to anchor Step 2
- [ ] Code, current OpenAPI, controller behavior, tests, ADRs, and persistence or interface evidence were inventoried first
- [ ] `design.md` reflects current behavior only, including DB and KVS side effects per node, explicit non-gates, `External Outcome Mapping Snapshot`, `Assertion Rules For Test Authors` covering external-to-internal conversion / post-success rollback / versioned-row trajectory, QA matrices, and developer policy
- [ ] Every reconstructed Mermaid `flowchart TD` is preceded by the convention banner; intermediate nodes carry only DB / KVS side effects; HTTP status codes and final response shapes appear only on terminal response nodes (one terminal per distinct response variant); persistence pre-state is branched explicitly; conditional best-effort writes are stated as conditionals in the matching node text
- [ ] Scenario IDs follow the contiguous-namespace convention: QA owns `S01..Sn`, dev owns `Sn+1..Sm`, the Dev-Only Verification table has a `Scenario ID` column, coverage rules carry `—`, no gaps, no `S##a`/`S##b` sub-IDs, and any pre-existing reserved gaps were renumbered with all references updated
- [ ] `QA Question Prevention Heuristic` walkthrough is complete and every applicable row is answered in plain text from current-behavior evidence
- [ ] When this repo owns the Internal API contract, OpenAPI reflects current behavior only and contains no flow diagrams, Saga prose, KVS prose, `external_ref_key` rules, or top-level "Error Code List" tables
- [ ] Each non-2xx response `description:` carries a per-response `Internal code | Message` table
- [ ] Each owned `(HTTP status, internal error code)` pair has its own grouped example in OpenAPI
- [ ] Repo-boundary, ownership, contract-routing, and contract-visible error-mapping drift is resolved or explicitly surfaced
- [ ] State model, routing, persistence, and contract decisions are grounded in current evidence
- [ ] Sibling specs were used only as sanity checks, not as primary evidence
- [ ] Review loop is complete: triage recorded, fixes applied for all required Critical and Major findings, re-review done, record saved in `docs/specs/{feature}/reviews/`

## References

- `platform/skills/sdd-design-and-contract/references/quality-bar.md`
- `platform/skills/sdd-design-and-contract/references/design-guide.md`
- `platform/skills/sdd-design-and-contract/references/repo-ownership-guide.md`
- `platform/skills/sdd-design-and-contract/references/contract-scope-guide.md`
- `platform/skills/sdd-design-and-contract/references/mapping-guide.md`
- `platform/skills/sdd-design-and-contract/references/review-criteria.md`
- [Reconstruction Checks](references/reconstruction-checks.md)
- `platform/docs/sdd-reverse-process.md`
- `platform/docs/testing.md`
