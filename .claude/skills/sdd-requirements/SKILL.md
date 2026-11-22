---
name: sdd-requirements
description: Create, update, or review a Tateca domain requirements doc under `product/requirements/` (business requirements and acceptance criteria with stable IDs). Use when a new feature needs requirements, an existing feature's behavior changes, an implemented feature without a requirements doc needs one drafted, or the user asks to review requirements. Not for API shape, implementation design, or tests.
---

# Requirements

`product/requirements/{domain}.md` is the agreed source of truth for what Tateca does and why. The PdM approves every change. Tests prove each AC by carrying its ID. Code is the source of truth only for details that no AC decides.
Keep architecture, HTTP shape, and implementation detail out.

## Before Drafting

1. Read `product/overview.md` and the domain doc you will touch. One domain has one doc: if the behavior belongs to an existing domain, update that doc. Create a new doc only for a new domain.
2. Audit sources with [Discovery Sources](references/discovery-sources.md).
3. Read the [Quality Bar](references/quality-bar.md).

## Route

| Situation | Route |
|-----------|-------|
| New domain, or new behavior in an existing domain | Create or Update |
| Existing behavior changes | Update |
| Implemented behavior with no doc yet | Draft from current behavior |

### Create or Update

1. Extract business context. Surface conflicts (quantitative limits, actor ownership, drift between the doc and code) before drafting.
2. Ask one batched round for unresolved business gaps.
3. Write or change the doc. On update, preserve confirmed behavior and change only the meaning, scope, or ACs that changed.
4. Give a new AC the next free number in its requirement (`R{n}-AC{m}`), and a new requirement the next free `R{n}`. Never renumber or reuse an ID. A removed AC leaves a gap.

### Draft from current behavior

1. Understand the area from code, tests, and git history (`/pstack:how`, `/pstack:why`). For an area that is large, untested, or hard to run, an RSF (Reverse Spec Flow) draft with `path:line` citations can be the input. Check each cited line before using it.
2. Make sure current behavior is pinned by characterization tests before anyone changes it. The implementation repo owns those tests.
3. List each observed behavior and ask the human to sort it: intended (becomes an AC), incidental (stays pinned by tests, not an AC), or bug (an issue, not an AC as written).
4. Write ACs only for intended behavior.

## Review

Every run that changes a doc ends with a review against the [Quality Bar](references/quality-bar.md) and every perspective in [Review Criteria](references/review-criteria.md).
Put findings and their resolution in the PR description, not in separate review files. Close only when no Critical or Major finding is open. The PdM approves the PR.

**Review only:** If the user asks for review without edits, report the findings and stop.

## Rules

- Base statements on code, tests, existing docs, or explicit confirmation. Do not invent business behavior. List unconfirmed behavior as open questions in the PR.
- Business-owned limits and conditions are ACs (for example, the maximum number of members in a group). Format-only rules (UUID format, date format) are not ACs.
- When a change alters ACs, the implementation repo updates the tests that carry those IDs in the same change. The AC trace check fails otherwise.

## Checklist

- [ ] The [Quality Bar](references/quality-bar.md) is satisfied
- [ ] IDs are stable: nothing renumbered, reused, or duplicated
- [ ] Open business questions are listed in the PR, not guessed
- [ ] Every review perspective ran, and findings with their resolution are in the PR description

## References

- [Discovery Sources](references/discovery-sources.md)
- [Quality Bar](references/quality-bar.md)
- [Review Criteria](references/review-criteria.md)
- `product/overview.md`
