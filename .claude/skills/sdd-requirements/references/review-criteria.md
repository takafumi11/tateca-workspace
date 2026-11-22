# Review Criteria

Record the review in `docs/specs/{feature}/reviews/` in the current repo. Use the common format in `platform/docs/sdd-process.md` and `platform/docs/review-record-template.md`.

After recording findings, run **Review → Triage → Fix → Re-review** from `review-record-template.md` until the step can close.

**Review only:** If the user asks for review without edits, run Review and Triage, leave open findings as `Needs Revision`, and stop.

| Review | Check |
|--------|-------|
| Senior Product Manager | Domain language, terminology, readability; one business outcome per AC; user-story and section wording cover the full AC outcome set; support sections add non-obvious business value instead of repeating shared terms or ACs; user-visible history, summary, notification, and shared-surface outcomes are present when source material requires them; unconfirmed business behavior is recorded as an open question rather than guessed |
| Senior QA | AC testability and `GIVEN / WHEN / THEN`; explicit execution boundary for continuation and retry semantics; observable terminal outcomes; no placeholders or test-routing leakage in AC text; precise business date and JST boundary wording for cutoffs; zero-amount, partial, full, cancelled, and terminal branches have unambiguous expected outcomes |
| Tech Lead | Current-repo vs dependency responsibility boundary; business-vs-design boundary; Step 2 derivability; consistency with existing design or contract quantitative baselines; design-owned details are absent or explicitly handed off to Step 2 or Step 3; infrastructure-only failure handling is kept out unless it changes a business-visible outcome |
| Sanity | Contradictions; duplicate AC IDs or placeholders; missing requirements; term-definition gaps; redundancy across sections or against ACs; Scope items that merely decompose another Scope item; shared terminology or user-facing surfaces that should be promoted to `platform/docs/STEERING.md` or `docs/domain-glossary.md` |
