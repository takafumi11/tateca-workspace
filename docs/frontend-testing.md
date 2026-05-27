# Frontend Testing Strategy

## Overview

This document defines frontend test types and their relationship to SDD artifacts.
Backend test policy remains in `docs/testing.md`.
Frontend tests verify `frontend-requirements.md` and the API behavior consumed by the frontend.

## Relationship To Backend Testing

| Concern | Backend doc | Frontend doc |
|---------|-------------|--------------|
| Domain AC verification | `requirements.md` -> Scenario / E2E in backend test owner repo | Not duplicated in frontend tests |
| Tateca API Contract | API Contract (OpenAPI) -> Controller Web Test | Contract fixtures and page tests consume the same contract |
| UX/UI AC verification | Out of scope for backend repo | `frontend-requirements.md` -> frontend tests |

Frontend tests must not re-prove backend domain outcomes already owned by backend Scenario or E2E tests.
They prove that the frontend surface behaves correctly for the branches defined in `frontend-requirements.md`.

## Testing Philosophy

### Principle 1: Tests Verify Specifications

| SDD Artifact | Primary Frontend Test Types |
|--------------|----------------------------|
| `frontend-requirements.md` FR ACs | Page/Integration Test, Browser E2E |
| API Contract (OpenAPI) | Contract fixture test, Page/Integration Test |
| Component behavior derived from FR ACs | Component Test |

### Principle 2: Classification Is Determined By The Boundary Under Test

- **Component Test:** Single UI unit behavior
- **Page/Integration Test:** Screen-level behavior with mocked API fixtures
- **Browser E2E:** End-user flow against staging or a deployed frontend with real API
- **Accessibility Test:** WCAG-oriented checks for owned interactive surfaces
- **Visual Regression Test:** Optional guard for stable layout; does not replace behavioral AC verification

### Principle 3: Use The Same FR AC IDs In Test Names

Mirror backend practice:

- `FR1-AC1` -> display name or test title includes `FR1-AC1`
- One FR AC may map to multiple tests only when the AC covers distinct visible branches

## Repo Test Ownership Rules

- Frontend AC ownership and test owner routing live in `design.md` `Frontend AC Ownership Matrix`.
- The frontend repo creates tests only for FR ACs where it is listed as `Test owner`.
- Tateca Backend does not create frontend UI tests.

## Recommended Test Layers

| Layer | Verifies | Typical tooling | When required |
|-------|----------|-----------------|---------------|
| Component Test | Isolated UI behavior from FR ACs | Jest/Vitest + Testing Library, Storybook interaction tests | Reusable widgets with branching display logic |
| Page/Integration Test | Screen behavior against mocked API fixtures | Testing Library, MSW or equivalent | Default layer for most FR ACs |
| Browser E2E | Full user journey in deployed environment | Playwright, Cypress | Critical flows and staging release gates |
| Accessibility Test | Keyboard, labels, roles, focus order | axe, Playwright a11y checks | Interactive surfaces with form or toggle controls |
| Visual Regression Test | Layout stability | Percy, Chromatic, Playwright screenshots | Optional for high-traffic surfaces |

## AC Verification Boundaries

| Verification item | Component | Page/Integration | Browser E2E | Backend Scenario/E2E |
|-------------------|:---------:|:----------------:|:-----------:|:--------------------:|
| Domain business outcome | | | | **Owner** |
| Button/input enabled vs disabled | **Owner** | **Owner** | Spot-check | |
| Loading/in-flight guard | **Owner** | **Owner** | Spot-check | |
| Success message or amount display | | **Owner** | **Owner** | |
| Error message mapped from API error code | | **Owner** | **Owner** | |
| Navigation or refresh after success | | **Owner** | **Owner** | |
| API side effects | | | | **Owner** |

## RED / GREEN Guidance

Frontend SDD follows the same specification-first intent as backend SDD:

1. Fix or reference domain `requirements.md` and API Contract dependencies.
2. Author `frontend-requirements.md` FR ACs.
3. Add failing Page/Integration or E2E tests for owned FR ACs (RED).
4. Implement frontend changes until owned tests pass (GREEN).

Component tests may be added in parallel when they reduce fixture cost for the same FR AC.

## Fixture Rules

- Prefer API fixtures that match published API Contract examples.
- Do not encode backend-only fields that the frontend never consumes.
- Preserve user-visible branch differences explicitly.
- Shared FR AC cases should use one fixture set for Page/Integration tests and the same case titles for Browser E2E where feasible.

## Naming Guide

| Test type | Typical location | Typical name |
|-----------|------------------|--------------|
| Component Test | `src/components/.../*.test.tsx` | `{ComponentName}.test.tsx` |
| Page/Integration Test | `src/pages/.../*.integration.test.tsx` | `{PageName}.integration.test.tsx` |
| Browser E2E | `e2e/{feature}.spec.ts` | `{feature}.spec.ts` |
| Shared FR case catalog | `e2e/scenarios/{feature}.ts` or test helper module | `{Feature}FrontendScenarios` |

Use FR AC IDs in display names so `design.md` routing stays traceable during review.
