# Review Criteria

Record findings in the PR description, each with severity (Critical, Major, Minor), location, comment, and resolution. Fix every Critical and Major finding, then re-run the affected perspectives.

**Review only:** If the user asks for review without edits, report the findings and stop.

| Review | Check |
|--------|-------|
| Senior Product Manager | Domain language, terminology, readability; one business outcome per AC; user stories and section wording cover the full AC outcome set; support sections add non-obvious business value instead of repeating shared terms or ACs; user-visible outcomes are present when source material requires them; unconfirmed business behavior is listed as an open question rather than guessed |
| Senior QA | AC testability in `GIVEN / WHEN / THEN`; explicit boundary for continuation and retry semantics; observable terminal outcomes; no placeholders or test-routing words in AC text; precise date and time-zone boundaries; zero-amount, partial, full, cancelled, and terminal branches have unambiguous expected outcomes |
| Tech Lead | Business-versus-implementation boundary; business-owned limits are ACs and match code and the API contract, or the drift is called out; implementation details are absent; infrastructure-only failure handling is kept out unless it changes a business-visible outcome |
| Sanity | Contradictions; duplicate, renumbered, or reused AC IDs; placeholders; missing requirements; term-definition gaps; redundancy across sections or against ACs; Scope items that merely decompose another Scope item; terms used across domains that should move to `product/overview.md` |
