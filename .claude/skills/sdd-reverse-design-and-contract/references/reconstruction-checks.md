# Reverse Reconstruction Checks (Step 2)

Use this file alongside `platform/skills/sdd-design-and-contract/references/quality-bar.md` during reverse Step 2 hygiene after the first draft and again before closing review findings.
This file covers reverse-only failure modes and hygiene checks beyond the shared Step 2 quality bar. It applies to both halves: the `design.md` narrative and the slim Internal API OpenAPI surface.

## Evidence Priority

Use sources in this order:

1. Current reverse Step 1 baseline
2. Current code paths and current runtime behavior, including controller-advice mapping for the OpenAPI half
3. Current OpenAPI files and current error-example files in the repo
4. Current contracts, contract tests, controller tests, scenarios, and integration tests
5. Current persistence or interface evidence such as migration files, schema docs, existing persisted values, or contract definitions
6. Existing design notes in the repo
7. Sibling specs only as sanity checks for wording, boundary patterns, or example structure

Within test evidence, prefer scenarios, integration tests, and service-level tests that exercise real routing and ownership paths.
Treat controller or unit tests built from synthetic mocks as weaker evidence when they can inject downstream failures or branches that the current implementation does not actually reach.

If sources disagree, do not smooth the conflict away. Surface the drift in the review record and keep both halves grounded in the strongest current-behavior evidence.

## Common Reverse Step 2 Failure Modes

### Narrative half (`design.md`)

- Inventing a cleaner repo boundary than the one current behavior actually uses
- Adding new structural elements or execution-surface splits that current evidence and code do not support
- Leaving multiple behavior paths at asymmetric granularity across the ownership matrix, flows, integration sections, and QA / developer matrices
- Restating Step 1 business rules instead of using AC IDs and owning only the technical mapping
- Hiding contract dependency order when published-boundary distinctions exist
- Assuming automated verification exists when the real verification path is configuration review, operational inspection, or another manual check
- Inferring architecture branches, ownership splits, or routing detail from mocked controller or unit tests instead of from current code plus real execution-path evidence
- Borrowing sibling-spec structure as if it were proof of current architecture in this repo
- Copying flow diagrams or persistence-rule prose into OpenAPI instead of keeping the narrative in `design.md`
- Leaving dropped legacy gates implicit (no in-flight gate, no amount pre-validation, no pre-call balance check) instead of naming the absence in plain text, which forces QA back to legacy specs to compare
- Reconstructing Mermaid `flowchart TD` blocks where a single node carries both side effects and an HTTP status code (HTTP statuses must move to dedicated terminal response nodes, one per distinct response variant; intermediate nodes keep only DB / KVS side effects)
- Collapsing branches with materially different DB / KVS side effects per persistence pre-state into one node (for example a single "ensure user" node hiding the new-user-only KVS write); the diagram must branch on the pre-state and surface each side-effect path
- Writing `KVS: no write` (or `DB: no write`) on a node whose runtime behavior is conditional (for example "KVS SET only when a brand-new row was just inserted"); the conditional must be stated in node text
- Documenting only the external response code while leaving the multi-cause-to-one-code conversion rule out of `Assertion Rules For Test Authors`
- Hiding post-success rollback semantics when current code can roll back finalization after an external `2xx` (typical "stays `RECOVERABLE`, returns `200`" behavior)
- Omitting the `version` column trajectory when the current implementation touches a versioned row in two separate steps in one request
- Preserving a non-contiguous scenario-ID namespace from the existing design (reserved gaps for "future" rows, `S##a` / `S##b` sub-IDs, dev-only rows interleaved with QA rows) instead of renumbering it into one contiguous range with QA-owned IDs first and dev-owned IDs after

### Contract half (Internal API OpenAPI)

- Inventing paths, parameters, schemas, status codes, or error codes that current behavior does not prove
- Preserving stale compatibility assumptions when controller behavior already differs from the existing contract
- Hiding contract-visible async, polling, idempotency, or terminal-result semantics that current callers depend on
- Reconstructing another repo's contract surface instead of the current repo's owned Internal API boundary
- Updating inline references but leaving `$ref` targets or separate error-example files stale
- Borrowing sibling-spec schema shapes or paths as if they were proof of current behavior in this repo
- Leaving narrative content (flow diagrams, Saga step prose, KVS prose, `external_ref_key` rules, top-level "Error Code List" markdown tables) in the OpenAPI description when those facts already live in `design.md`
- Collapsing multiple internal error codes that share the same HTTP status into one example instead of grouping one example per `(HTTP status, internal error code)` pair
- Omitting the per-response `Internal code | Message` markdown table from a non-2xx response `description:` (the table is mandatory; it replaces the old top-level Error Code List table)

## Reverse Step 2 Hygiene Pass

Before closing the draft, confirm all of the following:

### Narrative half

- `design.md` explains only current-behavior architecture decisions
- `AC Ownership Matrix`, `Canonical Testable Flows`, `External Integration Flows`, `External Outcome Mapping Snapshot`, `State Model`, `Assertion Rules For Test Authors`, `QA E2E Matrix`, `QA Contract E2E Matrix`, `Developer Verification Policy`, and `Data Model Decisions` stay aligned at comparable granularity
- Repo ownership, verification entrypoint, and test ownership are explicit for every owned AC
- State transitions and idempotency rules are grounded in current persistence or implementation evidence
- Contract dependency order and the OpenAPI handoff are explicit where downstream routing depends on them
- Any manual verification path is named explicitly instead of implied as a missing test
- Any new design branch added during reverse work is supported by current evidence, not by preference
- Non-gates intentionally absent in current behavior are named in plain text (for example "no in-flight transaction gate", "no per-order amount pre-validation"), not implied by the absence of a flow node
- Every reconstructed Mermaid `flowchart TD` is preceded by the convention banner; intermediate nodes carry only DB / KVS side effects; HTTP status codes and final response shapes appear only on terminal response nodes (one terminal per distinct response variant); persistence pre-state is branched explicitly when product behavior diverges per pre-state; conditional best-effort writes are stated as conditionals in the matching node text
- External-to-internal error conversion at the controller / advice layer is named in `Assertion Rules For Test Authors` when the current implementation collapses several internal causes into one external code: the rule names the external code, enumerates the internal causes, and confirms the response body never carries the internal cause
- Post-success rollback semantics are named in plain text whenever finalization can fail after an external `2xx` response
- Versioned-row (`version` column) trajectory across steps is named in plain text when the row is touched in two separate steps in one request
- The `QA Question Prevention Heuristic` walkthrough in `platform/skills/sdd-design-and-contract/references/design-guide.md` was completed and every applicable row is answered in plain text using current-behavior evidence
- Scenario IDs were reconstructed (or renumbered) into one contiguous namespace per feature: QA-owned concrete scenarios (`{FEATURE-PREFIX}-S01..Sn`) first, dev-owned concrete scenarios (`Sn+1..Sm`) after, no reserved gaps, no `S##a`/`S##b` sub-IDs, coverage rules in Dev-Only Verification carry `—` in the `Scenario ID` column, and every reference (test method names, source columns, prose) was updated

### Contract half

- OpenAPI documents only the current repo's owned Internal API surface
- Paths, parameters, schemas, status codes, and error codes reflect current behavior only
- Each owned `(HTTP status, internal error code)` pair has its own grouped example referenced via `$ref`
- Each non-2xx response `description:` carries an `Internal code | Message` markdown table covering every internal code that maps to that HTTP status
- The OpenAPI top-level operation description carries only short Business Rules summary (referencing AC IDs and `design.md` sections) and an optional short Dependencies one-liner
- No narrative content (flow diagrams, Saga prose, KVS prose, `external_ref_key` rules, top-level "Error Code List" tables) remains in the OpenAPI top-level description; relocated facts live in `design.md`
- Contract-visible async, polling, idempotency, or terminal-result semantics are explicit where relevant
- Compatibility drift or baseline correction is explicit when current behavior differs from the existing contract
- `$ref` targets and separate error-example files stay aligned with the referenced responses
- Any missing contract detail is traced back to reverse Step 2 ownership or semantics instead of guessed

## Sibling Spec Usage

Sibling specs can help spot clearer matrix patterns, flow splits, naming, or example structure, but they are not evidence.
Use them only to ask questions such as:

- "Is this repo hiding multiple behavior paths that should be separated explicitly in the QA matrix or developer matrix?"
- "Is this design naming a published-boundary distinction that really belongs in OpenAPI status / error codes instead of design narrative?"
- "Is this OpenAPI description leaking narrative that should live in `design.md` according to a cleaner sibling spec?"
- "Is this state, persistence, or contract decision grounded in current evidence, or copied from a nearby feature?"
