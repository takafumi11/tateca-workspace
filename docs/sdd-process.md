# Spec Driven Development (SDD) Process Guide

## Overview

This document defines the normal SDD flow for Tateca Backend.
It covers step order, document boundaries, repo ownership, and review handling.
Step-level procedures live in the corresponding Cursor skills.
Reverse SDD is a separate process documented in `docs/sdd-reverse-process.md`.

## Execution Context

Open this repository (`tateca-workspace`) in your editor. Tateca SDD artifacts live under `docs/`, API Contract files live under `contracts/`, and implementation lives in `tateca-backend` via `LOCAL_REPOSITORY_LINKS.md`.

Agent skills are maintained from a shared SDD skill source via user-level symlinks. In this repository, references to `current repo` or `this repository` mean `tateca-workspace` unless a skill explicitly says otherwise. Step 5 implementation work targets `tateca-backend`.

## Process Selection

Choose one process before selecting skills.
Finish this selection first; the normal step guidance below applies only after this document is confirmed as the active process.

| Situation | Process doc | Active skills |
|-----------|-------------|---------------|
| Implemented behavior exists and reverse reconstruction is required or already in progress, for example a baseline Step 1 is missing | `docs/sdd-reverse-process.md` | `sdd-reverse-requirements`, `sdd-reverse-design`, `sdd-reverse-openapi`, `sdd-reverse-black-box-test`, `sdd-reverse-tdd` |
| Brand-new feature, or feature work with an established baseline Step 1 already in place | `docs/sdd-process.md` | `sdd-requirements`, `sdd-design`, `sdd-openapi`, `sdd-black-box-test`, `sdd-tdd` |

This document covers only the normal SDD path.

## Core Principles

- Finish specifications before implementation: requirements -> design -> API Contract (OpenAPI) -> tests -> code
- Keep document boundaries clear: requirements describe WHAT, design describes HOW, API Contract defines the interface, and code implements it
- Do not duplicate the same fact across artifacts
- Write tests first, then implement until they pass

## Process Overview

```
Step 1: Requirements (Domain requirements + Acceptance Criteria)
   ↓
Step 2: High-Level Design (Processing flows, state transitions, domain models)
   ↓
Step 3: API Contract (OpenAPI)
   ↓
Step 4: Black Box Tests - RED (Scenario + Controller Web tests; E2E preparation when needed)
   ↓
Step 5: TDD Implementation (Service Unit + Integration Tests -> Local GREEN)
   ↓
Staging deployment -> E2E test execution when required
```

---

## Applying SDD To Existing Features

When normal SDD applies and a feature already has an established baseline `requirements.md`, follow the same Step 1-5 flow.
Update the existing artifact instead of creating a new one.

**Decision criteria:**
- Run Process Selection first
- If an SDD artifact (`requirements.md`, `design.md`, API Contract) already exists, review and update it using the corresponding skill
- Keep Step 2 current for every change; even a small HLD delta should record ownership, verification entrypoint, and contract boundaries explicitly
- For steps other than Step 2, skip only when the step skill explicitly allows it
- If reverse SDD applies, use `docs/sdd-reverse-process.md` and remain in reverse until baseline reconstruction is complete

---

## Repo Boundary Rules

Tateca Backend owns the REST API backend, domain behavior, persistence, internal scheduled/API-key flows, and API Contract in this repository.
Decide ownership in Step 2 when a feature also involves frontend, infrastructure, scheduled jobs, or external integrations.

- Keep one canonical set of domain ACs in `requirements.md`
- Add `frontend-requirements.md` only when a feature has a frontend-owned surface; keep UX/UI ACs there instead of expanding domain ACs
- Use `design.md` to assign the primary owner, supporting surfaces, verification entrypoint, and test owner for each AC
- Do not rely on implied routing, even for single-repo changes
- API Contract in this repository is authored as OpenAPI files under `contracts/`
- Use `design.md` as the ownership-routing source for Step 4 and Step 5
- UI design and frontend implementation stay in frontend-owned artifacts or repositories

## Step 1: Requirements

**Purpose:** Finalize domain-level business requirements and acceptance criteria. No technical concerns are included.

Support sections such as `Scope`, `Out of Scope`, `Common Preconditions`, `Processing Order`, and `Dependency Notes` are optional. Include them only when they remove meaningful business ambiguity.

**Skill:** `sdd-requirements`

**Artifact:** `docs/specs/{feature}/requirements.md`

**Reviewers:**
- **PDM:** Validity of business requirements and ACs, Out of Scope decisions
- **QA:** Completeness of ACs, testability, identification of ambiguities
- **Tech Lead:** Technical feasibility of business requirements

**Responsibilities of requirements.md:** Describes only business requirements, domain rules, and acceptance criteria. Technical concerns such as processing flows, state transitions, integration patterns, and HTTP status codes are not included. These are defined from Step 2 (design.md) onward.

---

## Step 2: Design — HLD (High-Level Design)

**Purpose:** Design how to realize the business requirements at the architecture level. Finalize processing flows, state transitions, domain models, ownership, and error strategies before defining the API Contract.

Step 2 is not skipped. Even simple or single-repo changes update `design.md` enough to make ownership, verification entrypoint, and contract dependency order explicit.

**Skill:** `sdd-design`

**Artifact:** `docs/specs/{feature}/design.md`

**Reviewers:**
- **Tech Lead:** Validity of processing flows, accuracy of state transitions, appropriateness of integration patterns
- **Developers:** Feasibility of processing flows, consistency with existing patterns

**On LLD (Low-Level Design):** This process does not create LLD as a separate document. Spring Boot's layered architecture (Controller -> Service -> Repository) and the test code created through TDD serve the role of LLD. Irreversible architectural decisions are recorded in `docs/ADR.md` when needed.

---

## Step 3: API Contract (OpenAPI)

**Purpose:** Define the source of truth for the Tateca API Contract in this repository. Translate consumer-visible behavior from `requirements.md` and `design.md` into the published API Contract. The contract is represented as OpenAPI files under `contracts/`. Skip Step 3 only when the feature does not change the API Contract.

**Skill:** `sdd-openapi`

**Artifacts:**
- `contracts/paths/{feature}.yaml`
- `contracts/components/schemas/requests/{Request}.yaml`
- `contracts/components/schemas/responses/{Response}.yaml`
- `contracts/components/examples/errors/{ERROR_CODE}.yaml`

**Reviewers:**
- **Tech Lead:** Error code taxonomy, appropriateness of status codes, consistency with existing APIs
- **Frontend:** Usability of request/response, field naming, ease of error handling implementation

---

## Step 4: Black Box Testing - RED

**Purpose:** Create external specification tests before implementation begins. Put owned AC cases in Scenario Tests and add Controller Web Tests when this repo owns the API Contract change.

**Routing ACs by verification boundary:** Each AC in requirements.md is routed to either a Scenario Test or an E2E Test based on whether verification requires actual side effects from external services. See `testing.md` for detailed routing rules.

| AC Characteristic | Test Type | Execution Environment |
|-------------------|-----------|-----------------------|
| Verification can be completed with Tateca Backend response, DB state, or WireMock interaction | Scenario Test | Local (Testcontainers + WireMock) |
| API Contract, validation, and exception-to-response mapping | Controller Web Test | Local (`@WebMvcTest`) |
| Verification requires real external side effects or deployed environment behavior | E2E Test | Staging environment |

ACs tagged with `[E2E]` in requirements.md are only subject to E2E Test verification.

**Skill:** `sdd-black-box-test`

**Artifacts:**
- `src/test/java/com/tateca/tatecabackend/scenario/{Feature}ScenarioTest.java`
- `src/test/java/com/tateca/tatecabackend/controller/{Controller}WebTest.java`
- E2E cases or notes when staging-only verification is required

**Reviewers:**
- **Developers (code review):** Correctness of AC mapping in Scenario Tests, test isolation, helper method design
- **QA:** Completeness of E2E test cases

**Test state at this point:**
- Scenario Test: **RED**
- E2E Test: Case preparation in progress (execution happens after staging deployment)

---

## Step 5: TDD Implementation

**Purpose:** Write tests first, then make them pass with implementation. Build bottom-up and make all tests GREEN.

**Skill:** `sdd-tdd`

**Reviewers:**
- **Developers (code review):** Implementation quality, test coverage, adherence to layer responsibilities

TDD execution order, RED -> GREEN transition rules, and stub creation timing are defined in the `sdd-tdd` skill.

**After Step 5 completion:** Deploy to the staging environment where the QA team executes E2E Tests. This confirms that external integrations verified via WireMock in Scenario Tests work as expected in the real environment.

---

## Document Responsibility Separation

| Document | Defines | Does Not Define |
|----------|---------|-----------------|
| `domain-glossary.md` | Project-wide business terms | Design terms, technical patterns (-> `ADR.md`) |
| `requirements.md` | Domain requirements, business rules, ACs, feature-specific terms | Processing flows, state transitions, HTTP details, implementation terms, per-field input validation (-> API Contract + Controller Web Test), UX/UI behavior (-> `frontend-requirements.md`) |
| `frontend-requirements.md` | Frontend UX/UI ACs for owned surfaces | Domain business outcomes (-> `requirements.md`), backend recovery or scheduled behavior |
| `design.md` | HLD: processing flows, state transitions, data models, integration patterns, error handling strategies, ownership routing | HTTP details for API Contract, DDL syntax (-> Flyway), layer implementation details / logging policies (-> code), pixel-level UI design |
| API Contract (OpenAPI) | HTTP interface contract, JSON schemas, error examples, input validation rules (`required`, `format`, `range`) | Domain requirements, processing flows, UI design, implementation detail |
| `testing.md` | Testing strategy, test type responsibilities, naming conventions | Feature-specific ownership routing (-> `design.md`), test items for individual features |
| Code + Tests | LLD: layer implementation, transaction boundaries, DB access | - |

### Information Flow

```
requirements.md (Defines WHAT)
    │
    ├──→ design.md (Defines HOW at the architecture level)
    │       │
    │       └──→ API Contract (OpenAPI) (Defines INTERFACE)
    │               │
    │               └──→ E2E Test case preparation (QA team, in parallel)
    │
    └──→ Scenario Test (Transforms ACs within service boundary into executable form)
```

---

## Review Conventions

All step reviews use the same format.

- Save review records in `docs/specs/{feature}/reviews/`
- Use one file per step run, for example `2026-05-27-step2-design-review.md`
- Append each iteration, its triage, fixes, and re-review result to the same file until the step closes
- Use `docs/review-record-template.md` as the starting format
- Each step review is a multiple-perspective review. Cover every reviewer listed in the owning skill's `references/review-criteria.md`, including `Sanity`
- Return one section per reviewer with a verdict of `Approved` or `Needs Revision`
- Record each finding with severity, location, comment, triage, and status

### Review Loop

Work proceeds in this order until the step can close:

1. **Review:** Checklist + multiple-perspective review; record findings.
2. **Triage:** Set `Triage` per finding (`Fix`, `Accept`, `Defer`, `Out-of-scope` per template). Critical and Major default to `Fix`.
3. **Fix:** Apply changes for every `Fix` finding; document under **Iteration N Resolution**.
4. **Re-review:** Re-run checklist and affected perspectives; close findings only when verified.

**Review-only:** When the user requests review without artifact edits, run Review and Triage, leave verdicts at `Needs Revision` if any finding is open, and stop. Do not mark the step approved.

---

## Artifact Directory Structure

```
docs/
├── sdd-process.md          ← This document (overall process)
├── sdd-reverse-process.md  ← Reverse SDD process
├── review-record-template.md
├── domain-glossary.md      ← Project-wide domain glossary (business terms only)
├── testing.md              ← Testing strategy (shared across all features)
├── STEERING.md             ← Project overview
├── ADR.md                  ← Architecture Decision Records
└── frontend-*.md           ← Frontend SDD extensions when applicable

products/tateca/
├── docs/specs/
│   └── {feature}/
│       ├── requirements.md          ← Domain requirements + ACs
│       ├── frontend-requirements.md ← UX/UI ACs when applicable
│       ├── design.md                ← High-level design
│       └── reviews/
│           └── YYYY-MM-DD-step2-design-review.md
└── contracts/internal-api/          ← API Contract source files
    ├── openapi.yaml
    ├── paths/
    │   └── {feature}.yaml      ← Path definitions
    └── components/
        ├── schemas/
        │   ├── requests/        ← Request schemas
        │   └── responses/       ← Response schemas
        └── examples/
            └── errors/          ← Error response examples

tateca-backend/src/test/java/.../
├── scenario/                ← Scenario Tests (Acceptance)
├── controller/              ← Controller Web Tests
└── service/
    ├── impl/                ← Service Unit Tests
    └── {Service}IntegrationTest.java  ← Integration Tests
```