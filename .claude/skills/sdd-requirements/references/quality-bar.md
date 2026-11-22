# Quality Bar

This quality bar applies whether the doc is written for new behavior or drafted from current behavior.
The evidence source differs, but the finished doc meets the same standard.

## Acceptance Criteria

- Use domain language only; reuse project terms.
- Write the ID in the text: `- **R{n}-AC{m}** GIVEN ... WHEN ... THEN システム SHALL ...`, under `### R{n}: <title>` and `#### Acceptance Criteria`. Preserve IDs across updates. Never renumber or reuse an ID; a removed AC leaves a gap.
- Write every AC in `GIVEN / WHEN / THEN`; one observable business outcome per AC at one scope or time boundary. Split mixed outcomes.
- Write business-owned limits and conditions as ACs (for example, maximum counts or lengths that the business decides). Format-only rules (UUID, date format) belong to the API contract. Other invalid input can share one business-level invalid-input AC.
- For continuation, retry, rerun, already-processed behavior, or terminal failure, name the concrete business boundary or persisted outcome. Do not specify retry cadence or count.
- Do not leave placeholders, unresolved markers, or duplicate AC IDs in final text. The only exception is configuration-owned open values; when used, document both the unresolved item and the later-change impact in the doc.
- Split requirements by actor, visible surface, and observable purpose. Do not group unrelated configurable or operational outcomes under one user story.
- If a business behavior is not confirmed, do not invent it. List it as an open question in the PR and keep confirmed ACs complete for the behavior that is fixed.

## Sections

- `Scope`, `Out of Scope`, `Common Preconditions`, `Processing Order`, `Dependency Notes`, and `Domain Definitions` are optional. Include each only when it removes non-obvious business ambiguity not already conveyed by the introduction or ACs. Each fact appears in exactly one section.
- `Scope`: short boundary summary. Do not restate the requirements or decompose a single capability across multiple lines.
- `Out of Scope`: non-obvious exclusions that prevent likely misunderstanding. Do not list obvious sibling-feature boundaries.
- `Common Preconditions`: shared business-visible baselines repeated across many ACs. Not obvious request prerequisites or facts already in the introduction or AC `GIVEN`s.
- `Processing Order`: only when business-critical ordering changes requirement meaning. Not request flow, recovery flow, or validation steps.
- `Dependency Notes`: cross-boundary facts that ACs cannot express. Do not replace this domain's behavior in ACs; do not duplicate AC or user-story content.
- `Domain Definitions`: domain-specific terms only. Move terms used across domains to `product/overview.md`.

## What Stays Out

- Keep WHAT and WHY only. HOW lives in code, the reasons for technical choices live in the PR, and interface shape lives in the API contract.
- Convert source, implementation, and contract evidence into business language. Do not carry endpoint names, operation names, query parameters, table or column names, class names, internal tool names, or response-field mapping into the doc unless that published surface is itself the business subject.
- Operational tuning values, retry cadence or count, concurrency, SLO targets, and internal constraints stay in code unless the business side explicitly owns the value or outcome.
- Keep dependency or reconciliation behavior in `Dependency Notes` unless that dependency itself is the business subject.
- Keep internal infrastructure-only failure handling out unless it changes a business-visible outcome.
- When code or the API contract disagrees with a limit or outcome in the doc, call out the drift. Do not silently align either side.

## Surfaces and Outcomes

- Ensure user stories and section narratives cover the full AC outcome set instead of overstating success-only behavior.
- Distinguish business date, execution date, and processing time. Write ACs against the selected business date; include processing timing only when it is a confirmed business boundary.
- When multiple user-visible surfaces are involved, give each surface its own requirement when audience or display differs.
- State zero-amount, partial, full, cancelled, and terminal outcomes separately when their visible result differs.
- Separate metadata from action history. A requirement may expose entity metadata while excluding a list of create, update, or cancel events.

## Common Checklist

Final pass before opening the PR. Check items not naturally enforced by following the rules.

- [ ] No placeholders, unresolved markers, duplicate or renumbered AC IDs, HTTP terms, implementation terms, or test-routing words remain in AC text
- [ ] Every requirement has testable ACs in `GIVEN / WHEN / THEN`, each with one observable outcome at one scope or time boundary
- [ ] Source, implementation, and contract evidence are rewritten into business language; implementation details are left to code and interface details to the API contract
- [ ] Business-owned limits are ACs; format-only rules are not
- [ ] Support sections add non-obvious value with no redundancy across sections or against ACs
- [ ] `Domain Definitions` are domain-specific; cross-domain terms are in `product/overview.md`
- [ ] Dependency notes do not replace this domain's behavior in ACs
- [ ] Continuation, retry, rerun, already-processed, and terminal-state wording uses observable business boundaries
- [ ] Open business questions are listed in the PR, while confirmed requirements remain complete and testable
- [ ] User stories and section narratives cover the full AC outcome set
- [ ] Limits and outcomes match code and the API contract, or the drift is called out
