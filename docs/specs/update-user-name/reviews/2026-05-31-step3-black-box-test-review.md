# SDD Review Record — update-user-name / Step 3 Black-Box Tests (Reverse SDD)

## Scope

- Feature: `update-user-name`
- Step: `Step 3 - Black-Box Tests (Reverse SDD)`
- Current repo: `tateca-backend`
- Artifact(s):
  - `src/test/java/com/tateca/tatecabackend/scenarios/UpdateUserNameTestDataSetup.java` (新規作成 — setup/verify contract interface)
  - `src/test/java/com/tateca/tatecabackend/scenarios/UpdateUserNameScenariosTests.java` (新規作成 — shared AC scenarios interface)
  - `src/test/java/com/tateca/tatecabackend/scenario/testcontainers/UpdateUserNameTestcontainersTest.java` (新規作成 — Testcontainers executor)
  - `src/test/java/com/tateca/tatecabackend/scenario/e2e/UpdateUserNameE2ETest.java` (新規作成 — @Disabled E2E executor)
  - `src/test/java/com/tateca/tatecabackend/rest/TatecaRestClient.java` (更新 — `updateUserName`・`updateUserNameWithoutContentType`・`updateUserNameWithoutUid` 追加)
  - `src/test/java/com/tateca/tatecabackend/rest/MockMvcTatecaClient.java` (更新 — 上記3メソッド実装追加)
  - `src/test/java/com/tateca/tatecabackend/scenario/UpdateUserNameScenarioTest.java` (削除 — 3層構造に置き換え)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/update-user-name/requirements.md` | R1〜R5 全 AC |
| Reverse Step 2 design.md | `docs/specs/update-user-name/design.md` | AC Ownership Matrix、QA E2E Matrix、QA Contract E2E Matrix、Developer Verification Policy、Verification entrypoint |
| Reverse Step 2 OpenAPI | `contracts/paths/users-userId-update-user-name.yaml` | status codes、error codes、grouped examples |
| 既存 Scenario Test | `UpdateUserNameScenarioTest.java` (旧) | R1〜R5 全 AC を MockMvc + Testcontainers MySQL で検証済み |
| 既存 Controller Web Test | `UserControllerWebTest.java` | 全 HTTP status codes および `error_code` アサート完備 |
| 参照パターン | `add-member` (scenarios/scenario/testcontainers/e2e 構造) | 3層分離パターン |

---

## Step 3 Scope Decision

- tateca-backend は `Test owner`（全 AC）かつ Tateca API Contract 所有者
- **Scenario Test:** 3層構造に再構成（`scenarios/` 共有 interface + `scenario/testcontainers/` executor + `scenario/e2e/` executor）
- **Controller Web Test:** 既存 `UserControllerWebTest` が全 Contract E2E Matrix 行をカバー済み（`error_code` アサート完備）— 変更不要
- **E2E Test:** `UpdateUserNameE2ETest` を `@Disabled` で作成。ステージング実装は別 PR で対応

---

## Gap Analysis

| design.md 行 | 既存テストカバレッジ | Gap | 対処 |
|-------------|-------------------|-----|------|
| UUN-S01: 正常更新 (R1-AC1, R1-AC2) | `UpdateUserNameScenariosTests.uunS01_r1Ac1Ac2_updateNameAndPersist` ✅ | なし | — |
| UUN-S02: Trim (R2-AC1) | `uunS02_r2Ac1_trimWhitespace` ✅ | なし | — |
| UUN-S03: 未認証 (R3-AC1, R3-AC2) | `uunS03_r3Ac1Ac2_rejectUnauthenticated` ✅ | なし | — |
| UUN-S04: 同値冪等 (R4-AC1〜AC3) | `uunS04_r4Ac1Ac2Ac3_sameValueIdempotent` ✅ | なし | — |
| UUN-S05: 不存在 (R5-AC1) | `uunS05_r5Ac1_notFound` ✅ | なし | — |
| Contract: `VALIDATION.FAILED` (blank) | `shouldReturn400WithErrorsArrayWhenEmpty` — `error_code` + `errors` アサート ✅ | なし | — |
| Contract: `VALIDATION.FAILED` (超過) | `shouldReturn400WhenExceedsMaxLength` — `error_code` アサート ✅ | なし | — |
| Contract: `VALIDATION.FAILED` (null) | `shouldReturn400WhenNull` — `error_code` アサート ✅ | なし | — |
| Contract: `REQUEST.MALFORMED_JSON` | `shouldReturn400WithMalformedJsonErrorCode` — `error_code` アサート ✅ | なし | — |
| Contract: `USER.FORBIDDEN` (403) | `shouldReturn403WithForbiddenErrorCode` — `error_code` アサート ✅ | なし | — |
| Contract: `REQUEST.UNSUPPORTED_MEDIA_TYPE` (415) | `shouldReturn415WhenContentTypeMissing` — `error_code` アサート ✅ | なし | — |

---

## Iteration 1

### Reviewer: QA (AC Completeness & Scenario/E2E Routing)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Minor | `UpdateUserNameTestcontainersTest` | `createGroup` に空リスト `List.of()` を渡していたため `POST /groups` が 400 を返し setup が失敗 (RED)。原因: `POST /groups` の `participants_name` は 1〜9 名の必須バリデーションがある。`List.of("Member")` に修正して GREEN になった | Fix | Closed |

### Reviewer: Engineer (Ownership & Entrypoint Fidelity)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `UpdateUserNameScenariosTests` は `PATCH /users/{userId}` + `GET /groups/{groupId}` を Verification entrypoint として正しく使用。`UserControllerWebTest` は `@WebMvcTest` で Web レイヤーのみ対象。401 は `dev` プロファイルで `x-uid` ヘッダーなしで MockMvc を呼ぶことで Testcontainers executor でも証明可能。他リポジトリの検証を担当していない | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | AC 検証は `UpdateUserNameScenariosTests` に集約されており重複なし。`UserControllerWebTest` はコントラクト検証のみ担当。孤立テストケースなし。ScenarioTest と WebTest の対象境界に矛盾なし | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（reverse Step 1 → reverse Step 2 → 既存テスト → OpenAPI）に従い監査した。将来の RED 期待値を発明していない。他リポジトリの検証を取り込んでいない。I1-1 の RED は setup gap（空リスト不可バリデーション）と分類した上でコード変更前に原因を特定してから修正した。全変更テストは GREEN で確認済み | — | — |

---

## Iteration 1 Resolution

- I1-1: `UpdateUserNameTestcontainersTest.ensureAuthenticatedUserWithGroup` の `createGroup` 呼び出しで `List.of()` を `List.of("Member")` に修正。`POST /groups` の `participants_name` バリデーション（1〜9名必須）を満たすよう修正
- 全変更テストが GREEN であることを `./gradlew test --tests "com.tateca.tatecabackend.scenario.testcontainers.UpdateUserNameTestcontainersTest"` で確認（5テスト BUILD SUCCESSFUL）

---

## Skill Checklist

### Common Quality Bar

- [x] 全ドラフトテストのオーナーシップが明示されている
- [x] ビジネス AC 検証がリポジトリ間で重複していない
- [x] owned AC ケースが `UpdateUserNameScenariosTests` に一度だけ定義されている
- [x] `scenario/testcontainers/` が owned shared-case セットを実行している
- [x] Executor helper は claim された shared assertions を実行しており、一時的な検証ギャップは存在しない
- [x] Controller Web Tests が owned OpenAPI コントラクト面をカバーしている（既存 `UserControllerWebTest` が全行カバー済み）
- [x] Scenario と E2E entrypoint が `design.md` と一致している（`PATCH /users/{userId}` + `GET /groups/{groupId}`）
- [x] Consumer-visible async behavior — 本フィーチャーは同期レスポンスのみ（該当なし）
- [x] Cross-layer responsibility boundaries が尊重されている

### Reverse Reconstruction Hygiene Pass

- [x] Step 3 assets は current repo の owned surface のみを検証している
- [x] Owned AC cases が design.md QA E2E Matrix 行と 1:1 で対応している（UUN-S01..UUN-S05）
- [x] `scenario/testcontainers/` と Controller Web coverage が同一 owned Step 3 surface と整合している
- [x] Executor helpers が claim した shared assertions を実行しており、ギャップは明示的に記録されている（E2E executor は `@Disabled` プレースホルダー）
- [x] Shared setup が各 owned AC ブランチ（正常更新・trim・未認証・同値更新・不存在）を表現できる
- [x] Verification entrypoint が reverse Step 2 ownership と一致している
- [x] 全 reverse-created/updated テストが GREEN（実行確認済み）
- [x] I1-1 の RED は setup gap と分類し、コード変更前に原因を特定した

---

## Final Status

- Status: `Approved`
- Remaining notes: I1-1 (Closed — setup gap 修正)。全 Critical・Major finding が Closed。`UpdateUserNameScenariosTests`（QA E2E Matrix 全行 GREEN）と `UserControllerWebTest`（QA Contract E2E Matrix 全行 GREEN）で reverse SDD Step 3 baseline が確立。旧 `UpdateUserNameScenarioTest` は3層構造に置き換え済み。
