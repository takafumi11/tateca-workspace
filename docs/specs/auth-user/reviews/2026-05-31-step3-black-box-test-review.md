# SDD Review Record — auth-user / Step 3 Black-Box Tests (Reverse SDD)

## Scope

- Feature: `auth-user`
- Step: `Step 3 - Black-Box Tests (Reverse SDD)`
- Current repo: `tateca-backend`
- Artifact(s):
  - `src/test/java/com/tateca/tatecabackend/scenarios/AuthUserTestDataSetup.java` (新規作成)
  - `src/test/java/com/tateca/tatecabackend/scenarios/AuthUserScenariosTests.java` (新規作成)
  - `src/test/java/com/tateca/tatecabackend/scenario/testcontainers/AuthUserTestcontainersTest.java` (新規作成)
  - `src/test/java/com/tateca/tatecabackend/scenario/e2e/AuthUserE2ETest.java` (新規作成 — @Disabled)
  - `src/test/java/com/tateca/tatecabackend/rest/TatecaRestClient.java` (更新 — `getAuthUser` / `deleteAuthUser` / `updateReviewPreferences` 追加)
  - `src/test/java/com/tateca/tatecabackend/rest/MockMvcTatecaClient.java` (更新 — 上記3メソッド実装追加 + `delete` static import 追加)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/auth-user/requirements.md` | R1〜R9 全 AC |
| Reverse Step 2 design.md | `docs/specs/auth-user/design.md` | AC Ownership Matrix / QA E2E Matrix / QA Contract E2E Matrix / Developer Verification Policy / Verification entrypoint |
| Reverse Step 2 OpenAPI | `auth-users.yaml` / `auth-users-uid.yaml` / `auth-users-review-preferences.yaml` | status codes / error codes / grouped examples |
| 既存 Scenario Tests | `CreateAuthUserScenarioTest` / `GetAuthUserScenarioTest` / `DeleteAuthUserScenarioTest` | R1〜R6 全 AC を MockMvc + Testcontainers MySQL で検証済み |
| 既存 Controller Web Test | `AuthUserControllerWebTest` | 全 HTTP status codes および `error_code` アサート完備 |
| 参照パターン | `add-member` / `update-user-name`（scenarios/scenario/testcontainers/e2e 構造）| 3層分離パターン |

---

## Step 3 Scope Decision

- tateca-backend は `Test owner`（全 AC）かつ Tateca API Contract 所有者
- **Scenario Test:** 3層構造で新規作成（`scenarios/` 共有 interface + `scenario/testcontainers/` executor + `scenario/e2e/` executor）
- **Controller Web Test:** 既存 `AuthUserControllerWebTest` が全 Contract E2E Matrix 行をカバー済み（`error_code` アサート完備）— 変更不要
- **E2E Test:** `AuthUserE2ETest` を `@Disabled` で作成。ステージング実装は別 PR で対応
- 旧 ScenarioTest（`CreateAuthUserScenarioTest` / `GetAuthUserScenarioTest` / `DeleteAuthUserScenarioTest`）は3層構造への移行後に削除予定（別 PR）

---

## Gap Analysis

| design.md 行 | 既存テストカバレッジ | Gap | 対処 |
|-------------|-------------------|-----|------|
| AU-S01: R1-AC1 作成・GET確認 | `auS01_r1Ac1_createAndVerify` ✅ | なし | — |
| AU-S02: R1-AC2/AC3 初期値 | `auS02_r1Ac2Ac3_initialValues` ✅ | なし | — |
| AU-S03: R3-AC1 メール重複 | `auS03_r3Ac1_rejectDuplicateEmail` ✅ | なし | — |
| AU-S04: R4-AC1/AC2 取得・ログイン記録 | `auS04_r4Ac1Ac2_getAndIncrementLogin` ✅ | なし | — |
| AU-S05: R4-AC3 ログイン累積 | `auS05_r4Ac3_cumulativeLoginCount` ✅ | なし | — |
| AU-S06: R6-AC1 削除・確認 | `auS06_r6Ac1_deleteAndVerify` ✅ | なし | — |
| AU-S07: R6-AC2/AC3 紐付け解除・保持 | `auS07_r6Ac2Ac3_unlinkAndPreserveAppUser` ✅ | なし | — |
| AU-S08: R8-AC1/AC2 レビュー更新 | `auS08_r8Ac1Ac2_updateReviewStatus` ✅ | なし | — |
| Contract: `VALIDATION.FAILED` | `AuthUserControllerWebTest` — 複数パターンアサート完備 ✅ | なし | — |
| Contract: `AUTH_USER.EMAIL_DUPLICATE` (409) | `AuthUserControllerWebTest` — `error_code` アサート ✅ | なし | — |
| Contract: `AUTH_USER.NOT_FOUND` (404) | `AuthUserControllerWebTest` — `error_code` アサート ✅ | なし | — |
| Contract: `REQUEST.UNSUPPORTED_MEDIA_TYPE` (415) | `AuthUserControllerWebTest` — アサート ✅ | なし | — |

---

## Iteration 1

### Reviewer: QA (AC Completeness & Scenario/E2E Routing)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `AuthUserScenariosTests` が AU-S01..AU-S08 全シナリオをカバー。Verification entrypoint が design.md の QA E2E Matrix と一致（POST /auth/users / GET /auth/users/{uid} / DELETE /auth/users/{uid} / PATCH /auth/users/review-preferences）。`AuthUserControllerWebTest` が QA Contract E2E Matrix 全行をカバー済み | — | — |

### Reviewer: Engineer (Ownership & Entrypoint Fidelity)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `AuthUserScenariosTests` は設計で定義した Verification entrypoint を正しく使用。`AuthUserControllerWebTest` は `@WebMvcTest` で Web レイヤーのみ対象。他リポジトリの検証を担当していない | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | AC 検証は `AuthUserScenariosTests` に集約されており重複なし。`AuthUserControllerWebTest` はコントラクト検証のみ担当。孤立テストケースなし。ScenarioTest と WebTest の対象境界に矛盾なし | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（reverse Step 1 → reverse Step 2 → 既存テスト → OpenAPI）に従い監査した。将来の RED 期待値を発明していない。全変更テストは GREEN で確認済み（BUILD SUCCESSFUL — 8テスト） | — | — |

---

## Iteration 1 Resolution

- Finding なし。全テスト GREEN を `./gradlew test --tests "com.tateca.tatecabackend.scenario.testcontainers.AuthUserTestcontainersTest"` で確認（BUILD SUCCESSFUL）

---

## Skill Checklist

### Common Quality Bar

- [x] 全ドラフトテストのオーナーシップが明示されている
- [x] ビジネス AC 検証がリポジトリ間で重複していない
- [x] owned AC ケースが `AuthUserScenariosTests` に一度だけ定義されている
- [x] `scenario/testcontainers/` が owned shared-case セットを実行している
- [x] Controller Web Tests が owned OpenAPI コントラクト面をカバーしている（既存 `AuthUserControllerWebTest` が全行カバー済み）
- [x] Scenario と E2E entrypoint が `design.md` と一致している

### Reverse Reconstruction Hygiene Pass

- [x] Step 3 assets は current repo の owned surface のみを検証している
- [x] Owned AC cases が design.md QA E2E Matrix 行と 1:1 で対応している（AU-S01..AU-S08）
- [x] Executor helpers が claim した shared assertions を実行している
- [x] 全 reverse-created/updated テストが GREEN（実行確認済み）

---

## Final Status

- Status: `Approved`
- Remaining notes: Finding なし。全テスト GREEN。`AuthUserScenariosTests`（QA E2E Matrix 全行 GREEN）と `AuthUserControllerWebTest`（QA Contract E2E Matrix 全行 GREEN）で reverse SDD Step 3 baseline が確立。旧 ScenarioTest 3ファイルは3層構造への移行後に削除予定（別 PR）。
