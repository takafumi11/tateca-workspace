# Review Criteria

Record the review in `docs/specs/{feature}/reviews/` in the current repo. Use the common format in `platform/docs/sdd-process.md` and `platform/docs/review-record-template.md`.

After recording findings, run **Review → Triage → Fix → Re-review** from `review-record-template.md` until the step can close.

| Review | Check |
|--------|-------|
| Engineer | Current-repo ownership, code quality, contract adherence where applicable, idempotency and recovery behavior, current-repo-only boundary enforcement, and spec-anchored implementation (no silent drift from `design.md` or slim OpenAPI; any baseline change is recorded as a Step 2 review iteration) |
| Test Architecture | Branch coverage, unit vs integration deduplication, owned Step 3 green status, infrastructure-only integration scope, developer-only branch coverage from `design.md` `Dev-Only Verification`, Step 3 or contract alignment where applicable, and the **schema-validation contract test** (exists in `unit/controller/` for repos owning the Internal API contract, loads the OpenAPI YAML at runtime, validates request acceptance, response shape, status codes, per-response Internal Code Tables, and grouped error examples per [Quality Bar](quality-bar.md), and is GREEN in CI) |
| Spec Anchor | The implementation matches `design.md` (canonical flows, assertion rules, internal-log-code reference, non-gates) and the slim OpenAPI (paths, schemas, status codes, per-response Internal Code Tables, grouped error examples). Any discrepancy is either fixed in implementation, or escalated to a Step 2 review iteration before Step 4 closes. The schema-validation contract test is the executable evidence of this anchor |
| Sanity | Contradictions between code, tests, and specs; duplicate layer responsibility; missing ownership; broken green-path assumptions; mismatched test layering; schema-validation contract test missing or weakened (for example, asserting only HTTP status without response-body schema, or hardcoding paths instead of loading the YAML); silenced / skipped contract test |
