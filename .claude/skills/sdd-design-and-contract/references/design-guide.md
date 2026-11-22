# Design Guide (`design.md` Narrative Half of Step 2)

`design.md` is the narrative source of truth for Step 2.
Keep it current for every feature change.
This guide defines the canonical structure and the test-authoring detail required so QA can write E2E tests directly from this document.

## Required Structure

Use these sections in this order. Skip a section only when the rule under "Skip when" applies for the current feature.

```
# Design Document (HLD) — {Feature}

## Step 2 Scope and Ownership Rules
## Test Asset Shape
## AC Ownership Matrix
## Consumer Interaction Notes        (skip when frontend handoff is irrelevant)
## Contract Dependency Order and Step Routing
## Canonical Testable Flows
### Request Flow
### Recovery Flow                    (skip when no recovery path exists)
### Batch Flow                       (skip when no batch path exists)
## External Integration Flows
### {ExternalDependency} Integration  (one section per external dependency)
## External Outcome Mapping Snapshot  (skip when external mapping is trivial)
## State Model
## Assertion Rules For Test Authors
## QA E2E Matrix
## QA Contract E2E Matrix
## Developer Verification Policy
### Shared Scenario Mirroring
### Dev-Only Verification
### Local Proof Selection Rule
## Data Model Decisions
```

## Section Specifications

### Step 2 Scope and Ownership Rules

A short bulleted list that makes the QA / developer split explicit for this feature. Always include:

- "`design.md` is sufficient for QA to write E2E tests; every major flow node states what changes in DB, what changes in KVS, and what is unchanged."
- The QA tooling envelope (`restClient`, `dbClient`, `redisClient`, staging WireMock for external stubs).
- The ownership rule: branches reproducible with the QA tooling envelope stay in the QA matrix; branches needing product-internal failure injection move to the developer matrix.
- The shared scenario rule: shared business scenarios are written once and reused by QA E2E in staging and developer Testcontainers locally.

### Test Asset Shape

A short list naming the four asset shapes:

- One canonical shared scenario set
- One QA self-service E2E suite
- One QA self-service contract suite
- One local developer safety net

### AC Ownership Matrix

Use [Repo Ownership Guide](repo-ownership-guide.md) for the column meaning and rules.

### Consumer Interaction Notes

Include only when frontend handoff depends on backend semantics. Cover visible backend states, sync vs async completion, refresh / polling expectations, canonical state surface, and idempotency.

### Contract Dependency Order and Step Routing

Numbered list naming which repo's contract is fixed first, which downstream repos depend on it, and where Step 3 / Step 4 ownership lives.

### Canonical Testable Flows

One Mermaid `flowchart TD` per major path.

#### Node Content Rules

Split nodes into two roles. Each node belongs to exactly one role; do not mix the two.

1. **Intermediate (side-effect) nodes** describe what happens *inside* the flow. They must state, in this order:
   1. What this step is doing (short label, for example "Step3 Finalize in one DB transaction")
   2. What changes in DB at that step (table, columns, transition, `version` bump)
   3. What changes in KVS at that step — omit if the project has no KVS (key, fields, transition, best-effort vs required)
   4. What stays unchanged at that step when relevant

   Intermediate nodes **must not** carry an HTTP status code or a final response shape. If an intermediate node currently says `HTTP 200` or `500 E90003` while still having outgoing edges, split it: keep the side-effect description in the intermediate node and create a new terminal response node downstream.

2. **Terminal (response) nodes** are the leaves of each branch — the point at which the HTTP response leaves the API. They must state:
   1. The HTTP status code
   2. The final response shape that disambiguates this leaf from sibling leaves (for example `transactionStatus=FIXED`, `transactionStatus=RECOVERABLE`, `transactionStatus=FAILED`, error code `E20047`, error code `E90003`)
   3. **No** further DB / KVS description — those belong in the preceding intermediate node

   Each distinct external response variant gets its own terminal node, even when several branches converge through the same intermediate side-effect node. Do not collapse two response shapes into one shared terminal node and then describe both in prose.

#### Branching Rules

- Branches must label the trigger explicitly (for example "Daily limit exceeded", "Retryable Redeem failure", "Idempotent response", "user_balance row exists?"). Avoid color-only encoding for outcome semantics; outcome must be readable from text.
- When a single product step behaves materially differently for two persistence pre-states (for example "user exists vs new user", "agreement up to date vs agreement stale"), branch on that pre-state in the diagram and give each branch its own intermediate node. Do not hide divergent DB / KVS side effects behind a single node labeled "ensure user".
- When a step performs a best-effort write (DB or KVS) that may or may not happen depending on the runtime path (for example "KVS SET only when a brand-new row was just inserted"), state the conditional in the node text. Do not write `KVS: no write` on a node that conditionally writes.

#### Convention Banner

Place a short prose banner directly above each `flowchart TD` block restating the convention:

> Convention: HTTP status codes appear only on terminal response nodes. Intermediate nodes describe DB / KVS side effects only.

This makes the rule self-evident to a reader who opens the diagram in isolation.

#### Explicit Non-Gates

If a check that an existing legacy flow performed is intentionally absent in the new flow, name the absence in a short prose note above or below the flow diagram (or in `Assertion Rules For Test Authors`). QA must not be left to infer "no gate here" from the absence of a node. Examples that should be stated, not implied:

- "There is no in-flight transaction status gate. Existing `RECOVERABLE` / `FAILED` rows do not block a new request; the only request-time gates are duplicate `txKey`, daily operation limit, and missing latest agreement."
- "There is no per-order amount pre-validation. Out-of-bound amounts are surfaced by the external dependency and routed through the non-retryable client branch."
- "There is no pre-call balance check. Insufficient balance is surfaced by the external dependency."

When a previous spec or sibling spec performed the gate but this one does not, say so explicitly to prevent regression-vs-new-behavior questions.

### External Integration Flows

One subsection per external dependency. Each subsection contains:

1. A short prose lead naming when the dependency is called and which paths use it.
2. A fact table:
   ```
   | Item | Detail |
   |------|--------|
   | HTTP method and path | ... |
   | Called from | ... (request path / recovery path / batch) |
   | Request headers product adds | ... |
   | Request body fields product uses | ... |
   | Success fields product uses | ... |
   | Idempotent trigger | ... (or N/A) |
   | QA control surface | how WireMock or test seeding can drive this dependency |
   ```
3. A Mermaid mapping diagram showing how each HTTP / body outcome maps into product behavior (success, idempotent, retryable, terminal client error).

### External Outcome Mapping Snapshot

A single table covering external outcome → product interpretation → request-path outcome → recovery / batch outcome. Include only when the dependency has multi-branch error mapping that QA must author against.

### State Model

A `stateDiagram-v2` showing the lifecycle of the canonical persisted state (for example transaction lifecycle), plus a short note explaining the design intent of each state.

### Assertion Rules For Test Authors

A bulleted list capturing every rule tests must enforce that is not directly visible from the flow nodes alone:

- when history rows are written
- when external reference keys (`external_ref_key` and similar) are populated
- when KVS keys may or must not be written
- how first-time-user creation differs from balance update
- idempotency rules (which key, what window) — for both the request key (DB-side) and the external dependency idempotent response (idempotent body codes -> status lookup -> still finalize)
- daily-limit semantics (counted statuses, time boundary, timezone)
- carve-outs for QA-owned vs developer-owned branches stated as plain prose. **Do not reserve scenario ID slots for "future" rows or use suffixed sub-IDs (`S09a`, `S09b`).** Scenario IDs follow the contiguous-namespace rule below.
- finalization amount-source rules where mode or external confirmation matters
- **External-to-internal error conversion rules.** For every external response code that has multiple possible internal causes (for example `409 E20047` collapsing optimistic-lock + deadlock + data-integrity), state the conversion rule in plain text: "external `E20047` is returned for any of the following internal causes: ...". Confirm that the response body never carries the internal cause; QA asserts only on the external code.
- **Post-success rollback rules.** For every flow where a finalization step can fail after the external dependency already returned success, state in plain text what the persisted state ends up as (for example "if Redeem returned `2xx` but Step 3 finalize fails, the transaction stays `RECOVERABLE`, the request still returns `200`, and recovery will retry"). This is the rule QA repeatedly asks about; spelling it out in `Assertion Rules` prevents the question.
- **Versioned-row trajectory.** When a table uses optimistic locking via a `version` column and is touched in two separate steps (for example user creation in Step 0 and balance update in Step 3), state the expected `version` trajectory in plain text (for example "new `user_balance` row starts at `version=0` after Step 0, becomes `version=1` after Step 3 finalize; the row does not pass through `version=2` in a single request"). This prevents the recurring QA question "should `version` jump by 2?".
- **Field-by-field write semantics for shared rows.** When two flows write to the same row at different times (for example `transaction_history` initialized then finalized), spell out which columns are set at each step and which columns stay `NULL` until a specific external confirmation (for example "`fixed_time` and `external_ref_key` stay `NULL` for `RECOVERABLE` and `FAILED` rows; `external_ref_key` is set only with the confirmed external transaction id at successful finalization").

### Scenario ID Convention

Scenario IDs (for example `DEP-S01`, `WTH-S07`) form **one shared, contiguous namespace per feature**. Apply these rules to every Step 2 design:

- Use a `{FEATURE-PREFIX}-S##` shape where the prefix matches the feature folder name (typically the first three letters or a stable abbreviation). The same prefix is used by both QA and dev-owned scenarios.
- Numbering starts at `S01` and increases without gaps. **Do not skip numbers**, do not reserve future slots, and do not use suffixed sub-IDs (`S09a`, `S09b`, `S09-redis`).
- QA-owned concrete scenarios occupy the lower range (`S01..Sn`) and live in `QA E2E Matrix`. They are the scenarios reproducible with the QA tooling envelope.
- Dev-owned concrete scenarios continue with `Sn+1..Sm` and live in `Developer Verification Policy` -> `Dev-Only Verification`. They are the named scenarios that need product-internal failure injection (race orchestration, deterministic DB / system error injection, transactional rollback, side-effect failure injection, etc.).
- Coverage rules that are **not** single named scenarios stay in the Dev-Only Verification table without a scenario ID (use `—` in the `Scenario ID` column). Examples: "exhaustive OpenAPI error mapping", "external client mapping detail". Coverage rules describe a class of behaviors covered by other tests; they are not addressable test cases.
- If a QA-owned scenario is later promoted to dev-only or vice versa, **renumber the affected range so the namespace stays contiguous**, and update every reference (test method names, source columns, prose). Do not leave gaps or renamed-but-skipped IDs.
- The carve-out paragraph in `Step 2 Scope and Ownership Rules` must restate the convention in plain text and name the QA range and the dev range explicitly (for example "QA owns `DEP-S01..DEP-S13`; dev-only concrete scenarios continue at `DEP-S14`").

### QA E2E Matrix

One row per QA-owned shared business scenario. Columns:

```
| QA E2E method | Source | Staging prerequisite or harness | Response checks | DB checks | KVS checks |
```

The `Source` column lists the scenario ID (`{FEATURE-PREFIX}-S##` from the contiguous namespace), the AC IDs from `requirements.md`, and the OpenAPI status / error code when relevant.

Only include rows that QA can drive with payloads, DB seed state, KVS assertions, and WireMock external stubs. Move every other branch to the developer matrix and renumber to keep the QA range contiguous.

### QA Contract E2E Matrix

One row per HTTP error case reproducible by payload, auth, DB seeding, method selection, or WireMock external stubs.

```
| QA contract E2E method | Source | Staging prerequisite or harness | Response checks | DB checks | KVS checks |
```

For pure rejection cases the DB and KVS check is "no business writes" / "no KVS write". This matrix is the QA companion to the contract surface defined by OpenAPI.

### Developer Verification Policy

#### Shared Scenario Mirroring

A short rule paragraph stating that the QA E2E matrix is the single canonical scenario matrix for shared business behavior, and that every QA-owned shared scenario must also be executable locally with Testcontainers + WireMock and prove the same response, DB, and KVS outcomes.

#### Dev-Only Verification

A table of branches that are intentionally developer-owned because QA cannot reproduce them with only staging clients and WireMock external stubs:

```
| Scenario ID | Verification item | Why it is developer-owned | Expected local proof |
```

- Concrete dev-owned scenarios get a `{FEATURE-PREFIX}-S##` ID continuing the QA range without gaps (see `Scenario ID Convention`). Examples: optimistic-lock conflicts, deterministic DB failures, generic uncaught exception mapping, Step 3 transactional rollback, KVS write failure suppression, side-effect failure suppression.
- Coverage rules that describe a class of behaviors rather than a single named scenario use `—` in the `Scenario ID` column. Examples: exhaustive OpenAPI error mapping, external client mapping detail.
- The first concrete dev-only row in the table starts at `Sn+1` where `n` is the highest QA-owned ID. New dev-owned scenarios are appended with the next free ID; do not interleave them between coverage rules.

#### Local Proof Selection Rule

A short bulleted list naming which local test layer is the lightest proof for which kind of rule (shared scenario plus Testcontainers, local contract suite, integration test, unit test). Step 2 names what must be proven; it does not predeclare unit test method names.

### Data Model Decisions

A short bulleted list naming irreversible storage decisions and the source-of-truth rule for any field whose persisted value depends on mode, idempotent handling, or external confirmation.

## Expand the HLD When

| Question | Example |
|----------|---------|
| Multi-step flow? | Batch workflow, staged processing |
| Repo or surface split? | Ajax plus Internal API, Batch plus Internal API |
| State transitions? | `PENDING -> RUNNING -> SUCCEEDED` |
| External integrations? | PPG, Campaign Entry API, callback flow |
| Recovery policy? | Retry, rerun, compensation |
| Schema changes? | New table, status column, unique key |

## Drafting Rules

- When both request-time and recovery / batch handling exist, keep the two paths at comparable granularity in `AC Ownership Matrix`, `Canonical Testable Flows`, integration routing, and the QA / developer matrices.
- When finalization or persisted value depends on mode, idempotent handling, or external confirmation, record the amount-source rule explicitly in `Assertion Rules For Test Authors` and `Data Model Decisions`.
- Keep Step 2 concise when the HLD delta is small, but do not omit ownership, verification routing, or the QA / developer matrices.
- Do not duplicate any text that lives in OpenAPI (paths, schemas, status codes, validation rules). Reference the OpenAPI surface by file path or by AC ID.
- Make non-gates explicit: any check the previous spec performed but the new spec intentionally drops must be named in plain text, not implied by the absence of a node.
- Make external-to-internal error conversion explicit: any external code that collapses multiple internal causes must have the conversion rule written in `Assertion Rules For Test Authors`, naming the external code, the internal causes, and that the response body never exposes the internal cause.
- Make post-success rollback explicit: if finalization can fail after an external success, name the persisted state and the response in `Assertion Rules For Test Authors` so QA does not need to ask "what code in the log if external was `2xx` but DB finalize failed?".

### QA Question Prevention Heuristic

Before closing the draft, walk through these recurring categories and confirm the spec already answers them in plain text. Each row pre-empts a class of QA questions that real specs in this product family have produced:

| Category | What must be explicit in `design.md` |
|----------|--------------------------------------|
| External `2xx` + DB finalize failure | The persisted state and the response (typically "stays `RECOVERABLE`, returns `200`"). State which DB step is rolled back. |
| External idempotent response | The conversion path (idempotent body code -> status lookup -> finalize as success), including which response field becomes `external_ref_key`. |
| Multiple internal causes collapsed into one external code | The conversion rule named in plain text and the explicit statement that the response body never exposes the internal cause. |
| `version` columns touched in two steps | The expected `version` value after each step and that the row does not skip values in one request. |
| Removed legacy gates | A short note: "no in-flight transaction gate", "no per-order amount pre-validation", "no pre-call balance check", etc. |
| External vendor body codes | A row in `External Outcome Mapping Snapshot` describing how the vendor body code maps into product behavior and the resulting external response code. |
| Best-effort side effects (KVS, Auto Deposit) | The rule that the main outcome is unaffected by side-effect failure; what is logged; whether QA can or cannot reproduce the failure with WireMock. |
| Async / accepted semantics | "`200 OK` does not mean immediate completion; recovery may continue asynchronously." Tie to the AC ID. |
| `external_ref_key` and similar | When it is `NULL`, when it is populated, and from which external response field. |
| Daily-limit / window semantics | Counted statuses, service-day boundary, timezone, and the rule for boundary times. |
| Scenario ID layout | The QA range and the dev range named in plain text, no gaps in numbering, no `S##a` / `S##b` sub-IDs, coverage rules in Dev-Only Verification carry `—` in the `Scenario ID` column. |
