# SDD Review Record Template

## Scope

- Feature: `{feature}`
- Step: `Step {n} - {artifact}`
- Current repo: `tateca-backend`
- Artifact(s): `{path}`

This template is the canonical review-loop record for every SDD step.
Keep shared triage semantics and loop rules here; the step skills should add only their step-specific checklists and review criteria.

Repeat the reviewer section below once per required review perspective from the owning skill's `references/review-criteria.md`, including `Sanity`.

## Review Loop (Mandatory)

Close a step only after this loop completes for that step.

1. **Review:** Run the owning skill checklist and multiple-perspective review. Record one reviewer section per perspective with verdict and findings tables.
2. **Triage:** For every finding row, set `Triage` to exactly one allowed value. Initial `Status` is `Open`.
3. **Fix:** For every finding with `Triage` = `Fix`, change the artifact or the minimum upstream spec and summarize the change under **Iteration N Resolution**.
4. **Re-review:** Re-run checklist and affected perspectives. Set `Status` to `Closed` only when the finding is verified fixed or superseded. If new findings appear, add rows and repeat from step 2.

**Review-only:** If the user asks for review without changing artifacts, run steps 1-2 only, set each perspective verdict to `Needs Revision` when any Critical/Major/Minor finding remains open, and stop. Do not set Final Status to `Approved`.

### Triage Values

| Triage | Meaning | Critical / Major |
|--------|---------|------------------|
| `Fix` | Address by changing the artifact or minimum upstream dependency | Default. Required unless an exception is explicitly approved. |
| `Accept` | Finding is wrong, duplicate, or acceptable as written; keep artifact unchanged | Only with explicit user or maintainer approval recorded in **Resolution**. |
| `Defer` | Correct finding, but tracked outside this step or iteration | Same as `Accept`: not allowed for Critical/Major without explicit approval. |
| `Out-of-scope` | Not in scope for this step; see `Out of Scope` or owning skill | Same as `Accept`. |

**Rule:** `Final Status` = `Approved` only when every Critical and Major finding is `Closed` with disposition consistent with its `Triage`.

## Iteration 1

- Reviewer: `{reviewer}`
- Verdict: `Approved` | `Needs Revision`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | `{file}:{line}` | `{finding}` | Fix | Open |

## Iteration 1 Resolution

- `{change}`

_(Repeat **Iteration N** (reviewer tables + resolution) until all Critical and Major findings are `Closed` and every reviewer verdict is `Approved`.)_

## Skill Checklist

Copy the checklist from the owning skill and check every item. Do not set Final Status to `Approved` until all items are checked.

- [ ] _{item 1 from the owning skill's Checklist}_
- [ ] _{item 2}_
- [ ] _{...}_

## Final Status

Set to `Approved` only when: (1) every reviewer verdict is `Approved`, (2) all Critical and Major findings have status `Closed` after the latest **Re-review**, and (3) every skill checklist item is checked.

- Status: `Approved` | `Needs Revision`
- Remaining notes: `{note}`
