# Step 1 Quality Bar

This quality bar applies to both normal and reverse Step 1 work.
The evidence source differs by mode, but the finished `requirements.md` should meet the same quality standard.

## Acceptance Criteria

- Use domain language only; reuse project terms.
- Assign stable AC IDs as `R#-AC#` and preserve them across updates.
- Write every AC in `GIVEN / WHEN / THEN`; one observable business outcome per AC at one scope or time boundary. Split mixed outcomes.
- Use one business-level invalid-input AC. Put field-level validation rules in the contract artifact.
- For continuation, retry, rerun, already-processed behavior, or terminal failure, name the concrete business boundary or persisted outcome. Do not specify retry cadence or count.
- Do not leave placeholders, unresolved markers, or duplicate AC IDs in final text. The only exception is configuration-owned open values; when used, document both the unresolved item and the later-change impact in `requirements.md`.
- Split requirements by actor, visible surface, and observable purpose. Do not group unrelated configurable or operational outcomes under one user story.
- If a business behavior is not confirmed, do not invent it. Record it as an open question in the review record and keep confirmed ACs complete for the behavior that is fixed.

## Sections

- `Source Links`, `Scope`, `Out of Scope`, `Common Preconditions`, `Processing Order`, `Dependency Notes`, and `Domain Definitions` are optional. Include each only when it removes non-obvious business ambiguity not already conveyed by the introduction or ACs. Each fact appears in exactly one section.
- `Scope`: short boundary summary. Do not restate the requirements or decompose a single capability across multiple lines.
- `Out of Scope`: non-obvious exclusions that prevent likely misunderstanding. Do not list obvious sibling-feature boundaries.
- `Common Preconditions`: shared business-visible baselines repeated across many ACs. Not obvious request prerequisites or facts already in the introduction or AC `GIVEN`s.
- `Processing Order`: only when business-critical ordering changes requirement meaning. Not request flow, recovery flow, validation steps, or other Step 2 sequencing.
- `Dependency Notes`: cross-boundary facts that ACs cannot express. Do not replace current-repo behavior in ACs; do not duplicate AC or user-story content.
- `Domain Definitions`: feature-specific terms only. Promote reusable business terms to `docs/domain-glossary.md`; promote shared product, system, or user-facing surface terms to `platform/docs/STEERING.md`. A reusable term whose amount, status, or eligibility is owned by a dependency still belongs in `domain-glossary.md`, not as a feature-local definition.

## Step 2 and Step 3 Handoffs

- Keep WHAT only; hand HOW to `design.md` and interface shape to Step 3 contract artifacts.
- Convert source, implementation, and contract evidence into business language before writing `requirements.md`. Do not carry endpoint names, operation names, query parameters, table or column names, batch class names, internal tool names, or response-field mapping into Step 1 unless that published surface is itself the business-facing subject.
- Operational tuning values, retry cadence or count, concurrency, SLO targets, internal constraints, and per-field validation rules belong in Step 2 or Step 3 unless the business side explicitly owns the value or outcome.
- Keep dependency or reconciliation behavior in `Dependency Notes` unless that dependency itself is the business subject.
- Keep internal infrastructure-only failure handling out of Step 1 unless it changes a business-visible outcome.
- If Step 1 intentionally omits technical names or mappings, make the matching downstream artifact own them explicitly: narrative, persisted-value rules, and side-effect grouping in `design.md`; contract surface, status or error codes, and validation in OpenAPI.
- When related design or contract artifacts already exist, align quantitative limits and ownership assumptions with them or call out drift explicitly.

## Surfaces and Outcomes

- Ensure user stories and section narratives cover the full AC outcome set instead of overstating success-only behavior.
- Distinguish business date, execution date, and processing time. Write ACs against the selected business date; include processing timing only when it is a confirmed business boundary.
- When multiple user-visible surfaces are involved, give each surface its own requirement when audience or display differs.
- State zero-amount, partial, full, cancelled, and terminal outcomes separately when their visible result differs, including whether a history or summary entry is created.
- Separate metadata from action history. A requirement may expose entity metadata while excluding a list of create, update, or cancel events.

## Common Checklist

Final pass before saving the review record. Check items not naturally enforced by following the rules.

- [ ] No placeholders, unresolved markers, duplicate AC IDs, HTTP terms, implementation terms, or test-routing leakage remain in AC text
- [ ] Every requirement has testable ACs in `GIVEN / WHEN / THEN`, each with one observable outcome at one scope or time boundary
- [ ] Source, implementation, and contract evidence are rewritten into business language; design-owned details are handed off to Step 2 or Step 3
- [ ] Support sections add non-obvious Step 1 value with no redundancy across sections or against ACs
- [ ] `Domain Definitions` are feature-specific; reusable terms were promoted to glossary or steering
- [ ] Dependency notes do not replace current-repo behavior in ACs
- [ ] Continuation, retry, rerun, already-processed, and terminal-state wording uses observable business boundaries
- [ ] Internal infrastructure-only edge cases, operational tuning values, and per-field validation rules are not promoted into ACs
- [ ] Open business questions are not guessed; they are recorded in the review record with owner/status, while confirmed requirements remain complete and testable
- [ ] User stories and section narratives cover the full AC outcome set
- [ ] Quantitative limits and ownership assumptions align with existing design or contract artifacts, or drift is called out
