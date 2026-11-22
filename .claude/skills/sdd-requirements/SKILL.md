---
name: sdd-requirements
description: Create or update `requirements.md` for Step 1 in normal SDD. Use when defining or reviewing business behavior and acceptance criteria after normal SDD has been selected. Not for Step 2 design or reverse SDD.
---

# SDD Requirements

`requirements.md` is the Step 1 source of truth for business-visible behavior. Keep architecture, HTTP contract, and implementation detail out.

## Before Drafting

1. Confirm normal SDD applies per `platform/docs/sdd-process.md`. If implemented behavior exists and baseline Step 1 is missing or reverse is already in progress, switch to `sdd-reverse-requirements`.
2. Read repository root `LOCAL_REPOSITORY_LINKS.md` when cross-repo paths may be needed (see [Discovery Sources](references/discovery-sources.md)); if missing or paths are `TBU`, stop and ask the developer to update it (copy from `LOCAL_REPOSITORY_LINKS.template.md`).
3. Read [Step 1 Quality Bar](references/quality-bar.md).
4. Locate `docs/specs/{feature}/` and audit upstream sources using [Discovery Sources](references/discovery-sources.md).
5. Read `platform/docs/testing.md` only for scenario coverage and validation boundaries.

## Route

| Normal SDD file state | Route |
|-----------------------|-------|
| `requirements.md` missing | Create |
| `requirements.md` exists | Update |

## Review loop

Every run that creates or changes `requirements.md` must complete **Review → Triage → Fix → Re-review** using `platform/docs/review-record-template.md`:

1. **Review:** Run the common checklist in [Step 1 Quality Bar](references/quality-bar.md) and every perspective in [Review Criteria](references/review-criteria.md).
2. **Triage:** Record findings in `docs/specs/{feature}/reviews/` with `Triage` and `Status` per the template. Critical and Major default to `Fix` unless explicit documented approval says otherwise.
3. **Fix:** Change `requirements.md` (or minimum upstream spec) for each `Fix` finding; document under **Iteration N Resolution** in the same review file.
4. **Re-review:** Re-run affected perspectives until all Critical and Major findings are `Closed` and every verdict is `Approved`.

**Review only:** If the user asks for review without edits, perform Review and Triage, set verdicts to `Needs Revision` when any finding is open, and stop.

## Workflow

### Create

1. Extract durable business context from sources; surface conflicts (quantitative limits, actor ownership, Step 1 vs Step 2 drift) before drafting.
2. Ask one batched round for unresolved business gaps.
3. Draft `requirements.md` in the current repo's established Step 1 style; complete the **Review loop**.

### Update

1. Preserve confirmed behavior; change only what changed in meaning, scope, or ACs.
2. If meaning, scope, or AC coverage changed, complete the **Review loop** with a new iteration in the existing review file.

## Rules

- Satisfy [Step 1 Quality Bar](references/quality-bar.md). Normal and reverse Step 1 must produce the same quality of `requirements.md`; only the evidence source differs.
- Base statements on repo docs or explicit user confirmation.
- Ask one batched round for unresolved business gaps after source audit and conflict surfacing.
- Preserve confirmed business behavior across updates unless the user changes it.
- Complete every review perspective listed in [Review Criteria](references/review-criteria.md), including `Sanity`.

## Checklist

- [ ] The common Step 1 quality bar in `platform/skills/sdd-requirements/references/quality-bar.md` is satisfied
- [ ] Source audit is complete and gaps are called out
- [ ] Conflicts are resolved before drafting
- [ ] Open business gaps were asked in one batched round or explicitly recorded as unresolved
- [ ] Review loop is complete: triage recorded, fixes applied for all required Critical and Major findings, re-review done, record saved in `docs/specs/{feature}/reviews/`

## References

- [Discovery Sources](references/discovery-sources.md)
- [Step 1 Quality Bar](references/quality-bar.md)
- [Review Criteria](references/review-criteria.md)
- `platform/docs/sdd-process.md`, `platform/docs/testing.md`, `platform/docs/review-record-template.md`
