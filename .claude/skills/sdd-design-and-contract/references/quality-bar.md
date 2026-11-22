# Step 2 Quality Bar (Design + Contract)

This quality bar applies to both halves of Step 2 — the `design.md` narrative half and the slim Internal API OpenAPI contract half — and to both normal and reverse Step 2 work. The evidence source differs by mode, but the finished artifact pair should meet the same standard.

## Common Rules

### Boundary and Ownership

- Focus on HOW. Reference AC IDs from `requirements.md` instead of restating business rules.
- Keep the canonical AC set in `requirements.md`.
- Assign one primary owner repo per AC.
- Make repo ownership, verification entrypoint, and test ownership explicit even for simple or single-repo changes.
- Make Step 3 ownership, contract dependency order, and Step 4 ownership derivable from `design.md`.
- Document backend-relevant interaction semantics only. Keep UI design and frontend implementation detail out.
- If Step 1 intentionally omits technical names or mappings, make Step 2 own them explicitly: per-field validation in OpenAPI, persisted-value rules and side-effect grouping in `design.md`.
- Keep `AC Ownership Matrix`, `Canonical Testable Flows`, `External Integration Flows`, `State Model`, and `Data Model` aligned at comparable granularity when multiple behavior paths exist.
- When finalization or persisted value depends on mode, idempotent handling, or external confirmation, document the source-of-truth rule explicitly in `design.md` (and surface only the contract-visible part in OpenAPI).
- If the real verification path is configuration review, operational inspection, or another manual path, name it explicitly in `design.md` instead of implying missing automation.

### `design.md` Narrative Half

- `design.md` must be sufficient for QA to write E2E tests without reverse-engineering service code.
- Every major flow node states what changes in DB, what changes in KVS, and what remains unchanged. Use Mermaid only when it clarifies flow or state.
- Mermaid `flowchart TD` blocks must split intermediate side-effect nodes from terminal response nodes. Intermediate nodes describe DB / KVS side effects only. **HTTP status codes and final response shapes appear only on terminal response nodes** (one per distinct response variant, even when several branches converge through a shared side-effect node). Each diagram is preceded by the convention banner: "HTTP status codes appear only on terminal response nodes. Intermediate nodes describe DB / KVS side effects only."
- Mermaid flows must branch on persistence pre-state when the product step behaves materially differently per pre-state (for example "user_balance row exists?" splitting into create / agreement-update / no-op subbranches), so divergent DB / KVS side effects are visible per branch and not hidden behind a single combined node.
- Conditional best-effort writes (DB or KVS writes that happen only on certain runtime paths, for example "KVS SET 0 only when a brand-new row was just inserted") are stated as conditionals in the relevant intermediate node. Do not write `KVS: no write` on a node that conditionally writes.
- External dependencies (OPP, JPP, PPG, PPS, etc.) get a dedicated `External Integration Flows` section per dependency: a small fact table (HTTP method and path, request fields product uses, success fields product uses, idempotent trigger, QA control surface) plus a Mermaid mapping diagram. When the dependency has multi-branch error mapping, also include an `Error Mapping Snapshot` table.
- Include an `Assertion Rules For Test Authors` section that captures the rules tests must enforce: when `user_balance_history` is written, when `external_ref_key` is populated, when KVS keys may be written, how first-time-user creation differs from balance update, idempotency rules, daily-limit semantics, any "QA-owned vs developer-owned" branch carve-outs, **external-to-internal error conversion rules**, **post-success rollback rules** (what state and response result when finalization fails after an external `2xx`), and **versioned-row trajectory** (expected `version` values after each step touching the row).
- Make non-gates explicit. Any check that a previous or sibling spec performed and the current spec intentionally drops (no in-flight transaction gate, no per-order amount pre-validation, no pre-call balance check, etc.) must be named in plain text in `Canonical Testable Flows` or `Assertion Rules For Test Authors` instead of being implied by the absence of a flow node.
- Include a `QA E2E Matrix` listing every QA-owned shared scenario (one method per row) and a `QA Contract E2E Matrix` for HTTP error cases reproducible by payload, auth, DB seeding, method selection, or WireMock OPP stubs. Both matrices show: source AC IDs, staging prerequisite or harness, response checks, DB checks, KVS checks.
- Include a `Developer Verification Policy` covering shared scenario mirroring (every QA-owned scenario must be runnable locally with Testcontainers + WireMock and prove the same response, DB, and KVS outcomes), a dev-only verification table (one row per branch QA cannot reproduce, with the reason and the expected local proof), and a local proof selection rule (which test layer to use). Step 2 names what must be proven; it does not prescribe specific unit test methods.
- Use a contiguous scenario-ID namespace per feature. QA-owned concrete scenarios occupy `{FEATURE-PREFIX}-S01..Sn` in `QA E2E Matrix`. Dev-owned concrete scenarios continue at `Sn+1..Sm` in `Dev-Only Verification`. The Dev-Only Verification table has a `Scenario ID` column; concrete dev scenarios carry an ID continuing the QA range, and coverage rules (for example "exhaustive OpenAPI error mapping", "external client mapping detail") carry `—`. Do not reserve future ID slots, do not skip numbers, and do not use suffixed sub-IDs (`S09a`, `S09b`). When ownership of a scenario moves between QA and dev, renumber the affected range so the namespace stays contiguous and update every reference.
- Keep protocol detail, DDL syntax, logging policy, and code structure out.
- Do not duplicate content from `requirements.md`. Reference the AC ID or Step 1 section instead.

### Internal API OpenAPI Contract Half

- Write only the current repo's owned Internal API contract.
- Write from the backend caller perspective.
- Reflect only contract-visible behavior from Step 1 and Step 2 narrative.
- Allowed top-level description content: short Business Rules summary that references AC IDs and `design.md` sections, short Dependencies one-liner naming external systems and storage. **Nothing else.**
- Forbidden top-level description content: detailed flow diagrams, Saga step prose, "Best Effort Strategy" prose, "Recovery Mechanisms" prose, KVS update prose, `transaction_history.external_ref_key` rules, AC ownership matrices, repo ownership prose, internal logging notes. All of this lives in `design.md`.
- Validation rules belong in schemas (`required`, `format`, `minLength`, `maxLength`, `minimum`, `maximum`).
- Each non-2xx response `description:` includes a small `Internal code | Message` markdown table listing every internal error code that maps to that HTTP status. The per-response table is mandatory; no top-level "Error Code List" table is allowed.
- Each HTTP status code in `responses:` also lists every internal error code that maps to that status as a separate example, with one example per `(HTTP status, internal error code)` pair (or per scenario if a code maps to multiple field-level scenarios), each `$ref`-ing a file in `components/examples/errors/`.
- Make compatibility impact explicit. Preserve released behavior unless an approved contract change or baseline correction is called out.
- Keep `$ref` targets correct and scoped to the owned contract surface.

## Common Checklist

### Boundary and Ownership

- [ ] HLD impact from `requirements.md` is captured
- [ ] `AC Ownership Matrix` is complete
- [ ] Each owned AC has one primary owner repo
- [ ] Repo boundaries, verification entrypoints, and test ownership are explicit
- [ ] `Consumer Interaction Notes` exist only when frontend handoff depends on backend semantics
- [ ] Multiple behavior paths are documented at comparable granularity in matrix, flows, integration, and data sections
- [ ] Mode-based, idempotent, or externally confirmed finalization rules are explicit in `design.md` where they affect state or persisted data
- [ ] Any manual verification path is named explicitly in `design.md` where automated tests are not the real verification path
- [ ] Step 3 ownership, contract dependency order, and Step 4 ownership are derivable without guesswork
- [ ] Technical mappings removed from Step 1 are explicitly owned in the matching half of Step 2
- [ ] No business-rule restatement, UI design, or implementation detail remains

### `design.md` Narrative Half

- [ ] `Canonical Testable Flows` covers every major path (request, recovery, batch, etc.) with DB and KVS side effects per node
- [ ] Every Mermaid `flowchart TD` is preceded by the convention banner; intermediate nodes carry only DB / KVS side effects; HTTP status codes and final response shapes appear only on terminal response nodes (one terminal node per distinct response variant); persistence pre-state is branched explicitly (for example "user_balance row exists?"); conditional best-effort writes are stated as conditionals in the matching node text
- [ ] Non-gates are named explicitly when a check from the previous or sibling spec is intentionally dropped (no in-flight gate, no amount pre-validation, no pre-call balance check, etc.)
- [ ] `External Integration Flows` is present per external dependency with fact table, Mermaid mapping, and (where relevant) error-mapping snapshot
- [ ] `External Outcome Mapping Snapshot` covers every external outcome that has a different request-path vs recovery / batch outcome
- [ ] `Assertion Rules For Test Authors` captures the rules QA and developer tests must enforce, including external-to-internal error conversion (external code, internal causes, and that the response body never carries the internal cause), post-success rollback semantics, versioned-row trajectory, and idempotent-response confirmation behavior
- [ ] `QA E2E Matrix` and `QA Contract E2E Matrix` cover every QA-owned shared scenario and contract case with response, DB, and KVS assertions
- [ ] `Developer Verification Policy` covers shared scenario mirroring, dev-only verification table (with `Scenario ID` column), and local proof selection rule
- [ ] Scenario IDs follow the contiguous-namespace convention: QA owns `S01..Sn`, dev owns `Sn+1..Sm`, no gaps, no `S##a`/`S##b` sub-IDs, coverage rules carry `—` in the Dev-Only Verification `Scenario ID` column, and the carve-out paragraph in `Step 2 Scope and Ownership Rules` names the QA range and the dev range explicitly
- [ ] `State Model` and `Data Model` decisions are documented where irreversible
- [ ] QA Question Prevention Heuristic in [Design Guide](design-guide.md) was walked through and every applicable row is answered in plain text

### Internal API OpenAPI Contract Half

- [ ] Current repo contract ownership is explicit (when this half applies)
- [ ] Consumer-visible behavior from `requirements.md` and `design.md` is reflected at the contract boundary only
- [ ] Request and response schemas match the owned contract
- [ ] Validation rules are complete and live in schemas
- [ ] Status codes and error codes are complete for the owned surface
- [ ] Each non-2xx response `description:` carries an `Internal code | Message` table for every internal code mapped to that HTTP status
- [ ] Each `(HTTP status, internal error code)` pair has its own grouped example referenced via `$ref`
- [ ] No flow diagrams, Saga prose, KVS prose, or `external_ref_key` rules remain in OpenAPI
- [ ] No top-level "Error Code List" markdown table in the operation description (per-response tables are the authoritative source)
- [ ] Contract-visible async, polling, idempotency, or terminal-result semantics are explicit where applicable
- [ ] Compatibility impact is preserved or explicitly called out
- [ ] No design duplication or implementation leakage remains
- [ ] `$ref` targets are correct
- [ ] Error examples are stored separately and stay aligned with referenced responses
