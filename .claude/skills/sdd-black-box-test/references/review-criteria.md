# Review Criteria

Record the review in `docs/specs/{feature}/reviews/` in the current repo. Use the common format in `platform/docs/sdd-process.md` and `platform/docs/review-record-template.md`.

After recording findings, run **Review → Triage → Fix → Re-review** from `review-record-template.md` until the step can close.

| Review | Check |
|--------|-------|
| QA | Owned AC completeness, Scenario vs E2E routing, entrypoint fidelity, async or visible-state coverage, and parity across shared cases and executors |
| Engineer | Repo ownership, `Verification entrypoint` fidelity, shared-scenario structure, Controller Web coverage, helper design, and current-repo-only boundary enforcement |
| Sanity | Contradictions between AC mapping and test ownership, duplicate coverage, missing executors, orphaned cases, or divergence between shared cases and executor coverage |
