# Discovery Sources

Read repo docs before asking the user.

## Order

| Priority | Source | Use | If missing |
|----------|--------|-----|------------|
| 0 | Root `LOCAL_REPOSITORY_LINKS.md` | Local paths to microservice checkouts when work crosses repositories | If missing or a needed path is `TBU`, stop and ask the developer to copy `LOCAL_REPOSITORY_LINKS.template.md` to `LOCAL_REPOSITORY_LINKS.md` and fill in paths |
| 1 | `docs/specs/{feature}/requirements.md`, nearby specs | Existing scope, terms, confirmed behavior | If implemented behavior exists but Step 1 is missing, select reverse SDD instead of a normal Step 1 run |
| 2 | `docs/specs/{feature}/design.md` | Existing Step 2 assumptions, ownership, quantitative baselines, drift detection | If missing for a changed feature, flag the Step 2 gap before drafting |
| 3 | OpenAPI and existing tests | Current visible behavior and compatibility constraints | Use as context only; do not copy HTTP detail into `requirements.md` |
| 4 | `docs/domain-glossary.md` | Project terms | Reuse stable terms from other docs and note the glossary gap |
| 5 | `platform/docs/STEERING.md`, PRD, policy docs, tickets | Product context, actors, permissions, dependencies | Ask for the missing document or a short confirmed summary |
| 6 | ADRs and architecture notes | Scope or terminology constraints | Keep technical detail out of the final document |
| 7 | User conversation | Resolve remaining ambiguity | Ask one batched round only |

## Extract

- Goal, actor, permission boundary, success outcome, rejection conditions and edge cases
- Source links reviewers need to validate the requirement page, proposal, ticket, or policy
- User-visible surfaces affected (product history, shared Bank-wide history, user summary, frontend/in-app UI, operational tools)
- Date/time boundaries that affect user eligibility, scheduled execution, cancellation, SLA, or visible history dates
- Quantitative business limits, and whether each limit is business-owned or should be handed to Step 2 / contract
- Outcome branches that change visible result (zero-amount, partial, full, recovery, cancellation) including whether history or summary changes
- Existing Step 2 assumptions that could conflict with Step 1 wording
- Business-level dependencies, out-of-scope items, and terms that need definition

If a durable source is missing, ask for the smallest stable artifact that unblocks drafting.
