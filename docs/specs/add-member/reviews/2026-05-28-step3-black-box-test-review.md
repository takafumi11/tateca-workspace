# SDD Review Record — add-member / Step 3 Black-Box Tests (Reverse SDD)

## Scope

- Feature: `add-member`
- Step: `Step 3 - Black-Box Tests (Reverse SDD)`
- Current repo: `tateca-backend`
- Artifact(s):
  - `src/test/java/com/tateca/tatecabackend/scenarios/AddMemberScenariosTests.java` (新規作成 — 共有シナリオ interface)
  - `src/test/java/com/tateca/tatecabackend/scenarios/AddMemberTestDataSetup.java` (新規作成 — setup/verify contract interface)
  - `src/test/java/com/tateca/tatecabackend/scenario/testcontainers/AddMemberTestcontainersTest.java` (新規作成 — Testcontainers executor)
  - `src/test/java/com/tateca/tatecabackend/scenario/e2e/AddMemberE2ETest.java` (新規作成 — @Disabled E2E executor)
  - `src/test/java/com/tateca/tatecabackend/rest/TatecaRestClient.java` (新規作成 — API client interface)
  - `src/test/java/com/tateca/tatecabackend/rest/MockMvcTatecaClient.java` (新規作成 — MockMvc implementation)
  - `src/test/java/com/tateca/tatecabackend/scenario/AddMemberScenarioTest.java` (削除 — 3層構造に置き換え)
  - `src/test/java/com/tateca/tatecabackend/controller/GroupControllerWebTest.java` (AddMemberTests セクション更新)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/add-member/requirements.md` | R1〜R5 全 AC、Domain Definitions |
| Reverse Step 2 design.md | `docs/specs/add-member/design.md` | AC Ownership Matrix、QA E2E Matrix、QA Contract E2E Matrix、Developer Verification Policy、Verification entrypoint |
| Reverse Step 2 OpenAPI | `contracts/paths/groups-groupId-members.yaml` | status codes、error codes、grouped examples |
| 既存 Scenario Test | `AddMemberScenarioTest.java` (旧) | Req1〜Req5 の全 AC を MockMvc + Testcontainers MySQL で検証済み |
| 参照パターン | `point-interest-api-internal` (scenarios/scenario/testcontainers/e2e 構造) | 3層分離パターン（shared interface / Testcontainers executor / E2E executor）|
| 既存 Controller Web Test | `GroupControllerWebTest.java` (AddMemberTests) | 全 HTTP status codes をカバー済み。`error_code` アサートの一部が欠落 |

---

## Step 3 Scope Decision

- `tateca-backend` は `Test owner`（全 AC）かつ Tateca API Contract 所有者
- **Scenario Test:** 3層構造に再構成（`scenarios/` 共有 interface + `scenario/testcontainers/` executor + `scenario/e2e/` executor）
- **Controller Web Test:** 作成対象（既存 `GroupControllerWebTest.AddMemberTests` に `error_code` アサート欠落があったため補完）
- **E2E Test:** `AddMemberE2ETest` を `@Disabled` で作成済み。ステージング実装は別 PR で対応

---

## Gap Analysis

| design.md 行 | 既存テストカバレッジ | Gap | 対処 |
|-------------|-------------------|-----|------|
| AM-S01: 正常系 (R1-AC1) | `AddMemberScenariosTests.amS01_r1Ac1_addedMemberAppearsInGroup` ✅ | なし | — |
| AM-S02: 未参加メンバー確認 (R1-AC2) | `amS02_r1Ac2_addedMemberIsUnjoined` ✅ | なし | — |
| AM-S03: メンバー数+1 (R1-AC3) | `amS03_r1Ac3_memberCountIncreasedByOne` ✅ | なし | — |
| AM-S04: 同名許可 (R1-AC4) | `amS04_r1Ac4_duplicateNameAllowed` ✅ | なし | — |
| AM-S05: グループ上限 (R3-AC1) | `amS05_r3Ac1_groupAtMaxSizeRejected` ✅ | なし | — |
| Contract: `VALIDATION.FAILED` (blank) | `shouldReturn400WhenMemberNameIsBlank` — status 400 のみ | `error_code` と `errors` 配列アサートなし | 追加 |
| Contract: `VALIDATION.FAILED` (長すぎ) | `shouldReturn400WhenMemberNameExceedsMaxLength` — status 400 のみ | 同上 | 追加 |
| Contract: `VALIDATION.FAILED` (null) | `shouldReturn400WhenMemberNameIsNull` — status 400 のみ | 同上 | 追加 |
| Contract: `GROUP.MAX_SIZE_REACHED` (409) | `shouldReturn409WhenGroupSizeLimitReached` — status 409 のみ | `error_code` アサートなし | 追加 |
| Contract: `REQUEST.UNSUPPORTED_MEDIA_TYPE` (415) | `shouldReturn415WhenContentTypeIsMissing` — status 415 のみ | `error_code` アサートなし | 追加 |
| R4-AC1 (403) | `shouldReturn403WhenNotGroupMember` + `error_code=USER.NOT_GROUP_MEMBER` ✅ | なし | — |
| R5-AC1 (404) | `shouldReturn404WhenGroupNotFound` + `error_code=GROUP.NOT_FOUND` ✅ | なし | — |

---

## Iteration 1

### Reviewer: QA (AC Completeness & Scenario/E2E Routing)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | `GroupControllerWebTest.java` AddMemberTests | `VALIDATION.FAILED` (3ケース)・`GROUP.MAX_SIZE_REACHED`・`REQUEST.UNSUPPORTED_MEDIA_TYPE` の `error_code` アサートが欠落しており、QA Contract E2E Matrix の観測可能なコントラクト挙動を完全に証明できていなかった | Fix | Closed |

### Reviewer: Engineer (Ownership & Entrypoint Fidelity)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `AddMemberScenarioTest` は `POST /groups/{groupId}/members` + `GET /groups/{groupId}` を Verification entrypoint として正しく使用。`GroupControllerWebTest` は `@WebMvcTest` で Web レイヤーのみを対象とし、境界が明確。401 は `TestSecurityConfig` がフィルターをバイパスする設計のためテスト対象外（設計上の既知の除外）。他リポジトリの検証を担当していない | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | AC 検証は `AddMemberScenarioTest` に集約されており、重複なし。`GroupControllerWebTest` はコントラクト検証のみ担当。孤立テストケースなし。ScenarioTest と WebTest の対象境界に矛盾なし | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（reverse Step 1 → reverse Step 2 → 既存テスト → OpenAPI）に従い監査した。将来の RED 期待値を発明していない。他リポジトリの検証を取り込んでいない。同一 AC が複数テストに分散していない。全変更テストは GREEN で確認済み | — | — |

---

## Iteration 1 Resolution

- I1-1: `GroupControllerWebTest.java` の `AddMemberTests` セクションに以下の `error_code` アサートを追加:
  - `shouldReturn400WhenMemberNameIsBlank`: `error_code=VALIDATION.FAILED`・`errors` 配列の存在確認を追加
  - `shouldReturn400WhenMemberNameExceedsMaxLength`: 同上
  - `shouldReturn400WhenMemberNameIsNull`: 同上
  - `shouldReturn409WhenGroupSizeLimitReached`: `error_code=GROUP.MAX_SIZE_REACHED` を追加
  - `shouldReturn415WhenContentTypeIsMissing`: `error_code=REQUEST.UNSUPPORTED_MEDIA_TYPE` を追加
- 全変更テストが GREEN であることを `./gradlew test --tests "com.tateca.tatecabackend.controller.GroupControllerWebTest"` および `./gradlew test --tests "com.tateca.tatecabackend.scenario.AddMemberScenarioTest"` で確認

---

## Skill Checklist

### Common Quality Bar

- [x] 全ドラフトテストのオーナーシップが明示されている
- [x] ビジネス AC 検証がリポジトリ間で重複していない
- [x] owned AC ケースが `AddMemberScenarioTest` に一度だけ定義されている
- [x] `scenario/testcontainers/` 相当（`AddMemberScenarioTest` は Testcontainers 使用）が owned shared-case セットを実行している
- [x] Executor helper は claim された shared assertions を実行しており、一時的な検証ギャップは存在しない
- [x] Controller Web Tests が owned OpenAPI コントラクト面をカバーしている
- [x] Scenario と E2E entrypoint が `design.md` と一致している
- [x] Consumer-visible async behavior — 本フィーチャーは同期レスポンスのみ（該当なし）
- [x] Cross-layer responsibility boundaries が尊重されている

### Reverse Reconstruction Hygiene Pass

- [x] Step 3 assets は current repo の owned surface のみを検証している
- [x] Owned AC cases が design.md QA E2E Matrix 行と 1:1 で対応している
- [x] `scenario/testcontainers/` (ScenarioTest) と Controller Web coverage が同一 owned Step 3 surface と整合している
- [x] Executor helpers が claim した shared assertions を実行しており、ギャップは明示的に記録されている（401 は `TestSecurityConfig` 設計上の既知除外）
- [x] Shared setup が各 owned AC ブランチ（同名重複・上限到達・未参加メンバー）を表現できる
- [x] Verification entrypoint が reverse Step 2 ownership と一致している
- [x] 全 reverse-created/updated テストが GREEN（実行確認済み）
- [x] Step 3 カバレッジの欠落は Step 2 ownership からトレースされており推測ではない

---

## Final Status

- Status: `Approved`
- Remaining notes: 全 Critical・Major finding が Closed。`AddMemberScenarioTest`（QA E2E Matrix 全行 GREEN）と `GroupControllerWebTest.AddMemberTests`（QA Contract E2E Matrix 全行 GREEN・`error_code` アサート完備）で reverse SDD Step 3 baseline が確立。
