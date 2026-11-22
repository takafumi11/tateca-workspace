# Discovery Sources

Read existing sources before asking the user.

All Tateca repositories sit side by side in one parent directory: `tateca-workspace`, `tateca-backend`, `tateca-web`, `tateca-ios`, `tateca-infrastructure`, `tateca-config`. From this repository, reach them as `../tateca-backend` and so on.

## Order

| Priority | Source | Use | If missing |
|----------|--------|-----|------------|
| 1 | `product/requirements/{domain}.md` and `product/overview.md` | Existing scope, terms, confirmed behavior, existing AC IDs | For implemented behavior with no doc, use the "Draft from current behavior" route |
| 2 | Code and tests in the implementation repos | Current behavior, current limits, which AC IDs tests already carry | Rewrite into business language. Do not copy class, table, or endpoint names |
| 3 | API contract | Visible behavior and compatibility constraints | Use as context only. Do not copy HTTP detail into the doc |
| 4 | Git history and PR discussions (`/pstack:why`) | Why a behavior exists, past decisions | Say that the record does not answer it |
| 5 | RSF draft, when one was made | Cited statements about current behavior | Check every citation before using it |
| 6 | PRD, tickets, user conversation | Product intent, actors, permissions | Ask one batched round only |

## Extract

- Goal, actor, permission boundary, success outcome, rejection conditions, and edge cases
- Source links reviewers need to validate the requirement (proposal, ticket, or policy)
- User-visible surfaces affected (iOS app, web, notifications, operational tools)
- Date and time boundaries that affect eligibility, scheduled execution, or visible dates
- Quantitative limits, and whether each one is business-owned (an AC) or format-only (left to the API contract)
- Outcome branches that change the visible result (zero amount, partial, full, cancellation)
- Drift between the doc, code, and the API contract
- Business-level dependencies, out-of-scope items, and terms that need definition

If a durable source is missing, ask for the smallest stable artifact that unblocks drafting.
