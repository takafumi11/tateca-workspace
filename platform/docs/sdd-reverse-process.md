# Reverse Spec Driven Development (Reverse SDD) Process Guide

## Overview

This document defines the reverse SDD flow for Tateca Backend.
Use it when reconstructing missing baseline SDD artifacts from already-implemented behavior.
Detailed reverse procedures live in the reverse artifact skills listed below.

## Relationship To Skills

Use this document as the shared source of truth for reverse-process execution context, current-behavior-only rules, and reverse review additions.
Reverse phases define the sequence of work. Reverse skills define the artifact slots and review units that reverse SDD reconstructs.

## Execution Context

Open this repository (`tateca-workspace`) in your editor for specs and contracts. Existing behavior is evidenced by code under `tateca-backend/src/`, API Contract (OpenAPI) files under `products/tateca/contracts/internal-api/`, tests under `tateca-backend/src/test/`, and existing SDD artifacts under `products/tateca/docs/specs/`.

Agent skills are maintained from a shared SDD skill source via user-level symlinks. In this repository, reverse SDD artifacts are written to `platform/docs/` and `products/tateca/`.

## Core Principles

- Reverse current behavior only; do not invent intended behavior
- Keep document boundaries clear: requirements describe WHAT, design describes HOW, API Contract defines the interface, and code implements it
- Reconstruct only missing or materially incomplete baseline artifacts required for Tateca Backend's owned scope
- Treat code, current docs, API Contract, and tests as evidence of current behavior
- Use the same review-template and testing foundations as normal SDD unless this process says otherwise

## Process Selection

Select reverse SDD before choosing skills.
A reverse-created Step 1 is not treated as an established baseline until the reverse run confirms it.

| Situation | Process doc | Active skills |
|-----------|-------------|---------------|
| Implemented behavior exists and reverse reconstruction is required or already in progress | This document | `sdd-reverse-requirements`, `sdd-reverse-design`, `sdd-reverse-openapi`, `sdd-reverse-black-box-test`, `sdd-reverse-tdd` |
| Brand-new feature, or feature work with an established baseline Step 1 already in place | `platform/docs/sdd-process.md` | Normal SDD step skills |

Once reverse SDD is selected, start with `sdd-reverse-requirements`.
If downstream artifacts are also missing or materially incomplete, continue with the corresponding reverse artifact skill in artifact order.
Normal SDD step skills may still be referenced as quality bars, but they are not the active reverse process.

## Reverse Baseline Artifact Skills

| Need | Skill |
|------|-------|
| Reconstruct Step 1 baseline | `sdd-reverse-requirements` |
| Reconstruct Step 2 baseline | `sdd-reverse-design` |
| Reconstruct Step 3 contract baseline | `sdd-reverse-openapi` |
| Reconstruct Step 4 external tests in GREEN | `sdd-reverse-black-box-test` |
| Reconstruct Step 5 internal tests in GREEN | `sdd-reverse-tdd` |

These skills share the same reverse process boundary, review-record handling, and current-behavior-only rule.

## Reverse Process Overview

```
Reverse Phase 0: Select reverse SDD upfront
   ↓
Phase 1: Inventory implementation, docs, API Contract, and tests
   ↓
Phase 2: Reconstruct baseline Step 1 from current behavior
   ↓
Phase 3: Reconstruct only missing downstream artifacts for the owned scope
   ↓
Phase 4: Verify against current behavior
   ↓
Phase 5: Review -> Triage -> Fix -> Re-review
   ↓
Phase 6: Confirm the reconstructed baseline
```

## Workflow

### 1. Inventory First

Read in this order:

1. Implementation under `src/main/`
2. Existing docs under `docs/`
3. Current API Contract files under `products/tateca/contracts/internal-api/`
4. Existing black-box and internal tests under `src/test/`
5. Adjacent systems only when behavior crosses repository boundaries

Produce a short inventory of:

- implemented business-visible behavior
- actors and permission boundaries
- ownership across surfaces
- missing artifacts by step
- mismatches between code, docs, tests, and contract files

### 2. Reconstruct Step 1

Use `sdd-reverse-requirements`.
Draft `requirements.md` from current behavior only.
Use `sdd-requirements` structure as the Step 1 quality bar, but treat code and passing behavior as evidence, not as a design target.

After the first draft, run a hygiene pass:

- remove Step 2 or Step 3 detail from Step 1
- if you remove a technical name or mapping from `requirements.md`, make Step 2 or Step 3 own it explicitly
- make request-time vs scheduled/internal API boundaries explicit when both exist
- check that user stories and idempotent or already-processed ACs describe the implemented business outcomes

### 3. Reconstruct Only Missing Downstream Artifacts

| Artifact | Reverse when | Skill |
|----------|--------------|-------|
| `design.md` | The required Step 2 artifact is missing or materially incomplete | `sdd-reverse-design` |
| API Contract (OpenAPI) | Tateca Backend owns the API Contract and that contract is missing or stale | `sdd-reverse-openapi` |
| Step 4 tests | External verification tests are missing or materially incomplete | `sdd-reverse-black-box-test` |
| Step 5 tests | Unit or integration protection is insufficient for current behavior | `sdd-reverse-tdd` |

If an artifact already exists, do not recreate it unless it clearly misses required baseline coverage.

### 4. Verify Against Current Behavior

- Reverse-created tests should start GREEN
- If a reverse-created test is RED, classify the cause before changing code:
  - implementation bug
  - stale contract or docs
  - wrong reverse inference

### 5. Shared Reverse Review Additions

For each active reverse step, run the normal step review criteria and also verify:

- **Product Fidelity:** no invented rules; actors, outcomes, user-story scope, and idempotent wording match current behavior; conflicts are surfaced instead of guessed
- **Architecture Boundary:** step boundaries and repo scope are correct; no unnecessary artifact recreation; no HLD or contract terms leak into Step 1; request vs scheduled/internal boundaries stay explicit
- **Test Protection:** reverse-created tests map to current behavior and start GREEN or have a classified RED cause
- **Sanity:** no contradictions, guessed behavior, missing source linkage, term or scope gaps, user stories narrower than their ACs, or sibling specs exposing a clearer boundary pattern

## Shared Foundations

- Use `platform/docs/sdd-process.md` for shared document responsibility separation and ownership rules
- Use `platform/docs/testing.md` for shared test-type responsibilities
- Use `platform/docs/review-record-template.md` for review records
- Use one review file per step run, as defined in `platform/docs/sdd-process.md`

## Process Boundary

Reverse SDD ends when the reconstructed baseline is documented and confirmed.
Any later feature-change work is a separate normal SDD process and is out of scope for the reverse run.
