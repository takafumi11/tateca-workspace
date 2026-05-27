# Testing Strategy

## Overview

Tests are classified by the specification they verify.
This document defines test types, shared policy, and the Java/Spring package layout used in Tateca Backend.
Feature-specific ownership is defined in `products/tateca/docs/specs/{feature}/design.md`.

```
┌────────────────────────────────────────────────────────────────────┐
│                  External Specification Tests                      │
│         Verifies specifications published outside the code         │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Scenario Test                                                │  │
│  │ Verifies: requirements.md ACs within Tateca Backend boundary │  │
│  │ SUT: All layers combined   Approach: MockMvc + real DB      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Controller Web Test (Contract Test)                         │  │
│  │ Verifies: API Contract (OpenAPI)                            │  │
│  │ SUT: Web layer only        Approach: Service mocked         │  │
│  └──────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────┤
│                  Internal Specification Tests                      │
│        Verifies design and implementation rules inside team        │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Service Unit Test (Domain Test)                             │  │
│  │ Verifies: Domain logic                                      │  │
│  │ SUT: Service layer only    Approach: Dependencies mocked    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Integration Test (Infrastructure Test)                      │  │
│  │ Verifies: Infrastructure-specific behavior                  │  │
│  │ SUT: Service + Infra       Approach: Real DB / WireMock     │  │
│  └──────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────┤
│  Cross-cutting: Security / API Client / Repository / Utility      │
└────────────────────────────────────────────────────────────────────┘
```

`SUT` = System Under Test

---

## Testing Philosophy

### Principle 1: Tests Verify Specifications

| SDD Artifact | Test Type |
|-------------|-----------|
| `requirements.md` ACs verifiable within Tateca Backend | Scenario Test |
| API Contract (OpenAPI) | Controller Web Test |
| Domain rules derived from `requirements.md` | Service Unit Test |
| Infrastructure requirements derived from `design.md` | Integration Test |
| ACs requiring deployed environment or real external side effects | E2E Test, documented separately when needed |

### Principle 2: Classification Is Determined By The Specification Under Test

Test classification is determined by what is being verified. Test technique alone is not a classification rule.

### Principle 3: External vs. Internal Depends On The Boundary Under Test

- External specification tests verify artifacts at the Tateca API boundary
- Internal specification tests verify rules used inside the implementation
- Controller Web Tests are external tests because they verify the published API Contract

### Principle 4: Each Test Type Has A Distinct Job

Each test type covers behavior that belongs to that layer.
Do not repeat business-outcome checks in lower layers or branch-level checks in higher layers unless there is a specific reason.

### What A Test Failure Indicates

| Test Type | A Failure Indicates |
|-----------|---------------------|
| Scenario Test | A business requirement is not met within Tateca Backend |
| E2E Test | A business requirement is not met in staging, or real integration behavior is broken |
| Controller Web Test | The API Contract is broken |
| Service Unit Test | There is a bug in the domain logic |
| Integration Test | Infrastructure behavior differs from expectations |

---

## Test Ownership Rules

- Keep one canonical set of domain ACs in `requirements.md`
- Scenario Tests are created for ACs that can be verified through Tateca Backend response, DB state, or WireMock interaction
- Controller Web Tests are created when the API Contract changes
- Service Unit Tests and Integration Tests are created for Step 5 code changes
- Supporting concerns such as security filters, API clients, repositories, and utilities use focused tests in their own packages
- Frontend UI tests belong to frontend-owned artifacts and are outside this backend testing document
- Frontend test policy lives in `platform/docs/frontend-testing.md`

Use `design.md` to make the `Test owner`, `Verification entrypoint`, and published-contract boundaries explicit before creating Step 4 or Step 5 tests.
Record these fields explicitly even for single-repo or low-complexity changes.

---

## Step-To-Package Mapping

Use the current Tateca package structure by step.

| Step | Create or update | Purpose |
|------|------------------|---------|
| Step 4 Black Box | `scenario/`, `controller/` | External specification tests for owned ACs and API Contract |
| Step 5 TDD | `service/`, `service/impl/`, infrastructure-specific packages | Internal tests for branch logic and real-infrastructure behavior |

### Step 5 Execution Order

For Step 5 implementation:

1. Make the relevant Service Unit Test RED.
2. Implement the core logic and make the unit test GREEN.
3. If the repo owns Controller Web Tests, make them GREEN through controller, DTO, validation, or handler changes.
4. Add Integration Tests only for behavior that needs real infrastructure, then make them GREEN.
5. Run final verification of the current repo's owned Step 4 and Step 5 tests.

This execution order is for normal SDD Step 5 implementation only.
When reverse SDD is active, follow `platform/docs/sdd-reverse-process.md` and the reverse Step 5 skill instead; reverse-created Step 5 tests start GREEN rather than RED-first.

---

## AC Verification Boundaries

Each AC in `requirements.md` is routed to the cheapest test layer that proves it without losing behavioral confidence.

| Verification item | Scenario | E2E | Controller Web | Service Unit | Integration |
|-------------------|:--------:|:---:|:--------------:|:------------:|:-----------:|
| Business requirements within Tateca Backend boundary | **◎** | | | | |
| Requests sent to external services | **◎** ※1 | **◎** ※3 | | | |
| Real external side effects or deployed environment behavior | | **◎** | | | |
| HTTP status codes | △ ※2 | △ ※2 | **◎** | | |
| Response JSON schema | | | **◎** | | |
| Bean Validation firing | | | **◎** | | |
| Exception -> response mapping | | | **◎** | | |
| Domain logic branching | | | | **◎** | |
| Repository call verification | | | | **◎** | |
| Actual DB persistence | | | | | **◎** |
| JPA lifecycle | | | | | **◎** |
| Character encoding | | | | | **◎** |
| Retry and fallback | | | | | **◎** |
| WireMock stub vs. actual API divergence | | **◎** | | | |
| Environment-specific issues | | **◎** | | | |

※1 Verified via `WireMock.verify` in local tests.
※2 Exhaustive status code verification belongs to Controller Web Tests.
※3 Real APIs by default; use staging stubs only when real APIs cannot reproduce the scenario.

### Input Validation - API Contract, Not AC Detail

Input validation rules belong to the API Contract, not to domain requirements.
They are defined in the API Contract (OpenAPI) and verified by Controller Web Tests.

- Keep one AC at business level: `GIVEN input is invalid WHEN request is sent THEN reject with input error`
- Define per-field validation rules (`required`, `format`, `range`) in API Contract, not in `requirements.md`
- Cover per-field validation exhaustively in Controller Web Tests

---

## Test Type Definitions

### Scenario Test

| Item | Details |
|------|---------|
| Specification under test | ACs derived from `requirements.md` |
| Perspective | API consumer's black-box perspective |
| Infrastructure | `AbstractIntegrationTest` + `@AutoConfigureMockMvc` |
| Naming | `{Feature}ScenarioTest` |
| Location | `src/test/java/com/tateca/tatecabackend/scenario/` |

**Responsibilities:** Execute AC cases locally, verify business outcomes, and verify stubbed external-service interactions where applicable.

### E2E Test

| Item | Details |
|------|---------|
| Specification under test | ACs requiring deployed environment or real external side effects |
| Perspective | Real integration behavior through staging deployment |
| Infrastructure | Staging environment |
| Naming | `{Feature}E2ETest` or external QA case ID |

**Responsibilities:** Verify real side effects, real integration behavior, and stub divergence that cannot be proven locally.

### Controller Web Test (Contract Test)

| Item | Details |
|------|---------|
| Specification under test | API Contract (OpenAPI) |
| Perspective | HTTP interface boundary |
| Infrastructure | `@WebMvcTest` + `@MockitoBean` |
| Naming | `{Controller}WebTest` |
| Location | `src/test/java/com/tateca/tatecabackend/controller/` |

**Responsibilities:** Status codes and response structure, Bean Validation, Service exception -> HTTP mapping, correct delegation to Service.

### Service Unit Test (Domain Test)

| Item | Details |
|------|---------|
| Specification under test | Domain rules derived from `requirements.md` |
| Perspective | White-box view of domain logic |
| Infrastructure | `@ExtendWith(MockitoExtension.class)` + `@Mock` / `@InjectMocks` |
| Naming | `{Service}UnitTest` or focused `{Service}{Feature}Test` |
| Location | `src/test/java/com/tateca/tatecabackend/service/` or `service/impl/` |

**Responsibilities:** Exhaustive coverage of domain rule branches and repository interaction verification.

### Integration Test (Infrastructure Test)

| Item | Details |
|------|---------|
| Specification under test | Infrastructure-specific behavior |
| Perspective | Real-environment behavior that cannot be verified with Unit Tests |
| Infrastructure | `AbstractIntegrationTest` (Testcontainers MySQL + WireMock) |
| Naming | `{Service}IntegrationTest` or focused infrastructure test |

**Responsibilities:** JPA lifecycle, DB encoding, transaction boundaries, custom queries, external API client retry and fallback.

---

## Concrete Examples: What Belongs Where

| Verification | Service Unit Test? | Integration Test? | Why |
|-------------|:------------------:|:-----------------:|-----|
| Authorization exception thrown | YES | NO | Domain logic branch |
| Entity not found exception thrown | YES | NO | Domain logic branch |
| Same-value update skips save | YES | NO | Domain logic branch |
| Normal update calls save | YES | NO | Repository interaction |
| Bean Validation fires | NO | NO | Controller Web Test |
| Trimming works | NO | NO | Controller Web Test or DTO-focused test |
| `@PreUpdate` updates `updated_at` | NO | YES | JPA lifecycle callback requires real DB |
| Same-value update does not change `updated_at` | NO | YES | Save skip must be proven through real DB state |
| Multibyte or emoji characters persist correctly | NO | YES | DB encoding requires real DB |
| Entity relationship preserved after update | NO | YES | FK constraints require real DB |
| Retry and fallback of external API client | NO | YES | WireMock and real HTTP client behavior are needed |

---

## Test Package Structure

Current Tateca Backend test layout:

```
src/test/java/com/tateca/tatecabackend/
  ├── AbstractIntegrationTest.java
  ├── fixtures/
  │   └── TestFixtures.java
  ├── scenario/
  │   └── {Feature}ScenarioTest.java
  ├── controller/
  │   └── {Controller}WebTest.java
  ├── service/
  │   ├── {Service}UnitTest.java
  │   ├── {Service}IntegrationTest.java
  │   └── impl/
  │       └── {Service}{Feature}Test.java
  ├── repository/
  ├── api/client/
  ├── security/
  ├── annotation/
  └── util/
```

### Minimal Naming Guide

| Test type | Package | Typical class name |
|-----------|---------|--------------------|
| Scenario Test | `scenario/` | `{Feature}ScenarioTest` |
| Controller Web Test | `controller/` | `{Controller}WebTest` |
| Service Unit Test | `service/` | `{Service}UnitTest` |
| Focused service behavior test | `service/impl/` | `{Service}{Feature}Test` |
| Integration Test | `service/`, `api/client/`, `repository/`, or relevant package | `{Target}IntegrationTest` |

Use AC IDs in display names where the test maps directly to an SDD acceptance criterion.
