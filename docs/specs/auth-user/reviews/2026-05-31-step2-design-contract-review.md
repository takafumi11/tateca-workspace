# SDD Review Record — auth-user / Step 2 Design + Contract (Reverse SDD)

## Scope

- Feature: `auth-user`（create / get / delete / update-review-preferences 統合）
- Step: `Step 2 - Design + Contract (Reverse SDD)`
- Current repo: `tateca-workspace` / `tateca-backend`
- Artifact(s):
  - `docs/specs/auth-user/design.md` (新規作成)
  - `contracts/paths/auth-users.yaml` (前 PR で更新済み — Business Rules + per-response tables + examples)
  - `contracts/paths/auth-users-uid.yaml` (更新 — per-response tables + grouped examples + Business Rules 追加)
  - `contracts/paths/auth-users-review-preferences.yaml` (更新 — per-response tables + grouped examples + Business Rules 追加)
  - `contracts/components/examples/errors/AUTH_USER_NOT_FOUND.yaml` (前 PR で作成済み)
  - `contracts/components/examples/errors/AUTH_USER_EMAIL_DUPLICATE.yaml` (前 PR で作成済み)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/auth-user/requirements.md` | R1〜R9 全 AC |
| 実装 | `AuthUserServiceImpl` | 4メソッド全実装（create/get/delete/updateAppReview） |
| Controller | `AuthUserController` | 4エンドポイント全定義 |
| Entity | `AuthUserEntity` | フィールド・@PrePersist・@PreUpdate |
| Auth Filter | `TatecaAuthenticationFilter` | 401 ルーティング（MISSING_CREDENTIALS / INVALID_FORMAT / INVALID_TOKEN） |
| Exception Handler | `GlobalExceptionHandler` | 400/409/404/415 ルーティング |
| Scenario Tests | `CreateAuthUserScenarioTest` / `GetAuthUserScenarioTest` / `DeleteAuthUserScenarioTest` | R1-AC1〜AC3 / R4-AC1〜AC3 / R6-AC1〜AC3 をカバー |
| Service Unit Test | `AuthUserServiceUnitTest` | 全メソッドのモックベース分岐テスト |
| Service Integration Test | `AuthUserServiceIntegrationTest` | @PrePersist/@PreUpdate / ログイン累積 / 紐付け解除 / enum 永続化 |
| Controller Web Test | `AuthUserControllerWebTest` | 全操作の 201/200/204/400/401/404/409/415 アサート完備 |
| OpenAPI (更新前) | `auth-users.yaml` / `auth-users-uid.yaml` / `auth-users-review-preferences.yaml` | per-response tables・examples なし |
| 旧 design.md | `create-auth-user/design.md` | 作成フローのみ（Step 2 で作成済み） |

---

## Gap Analysis

| design.md 必須セクション | 状態 | 対処 |
|--------------------------|------|------|
| Step 2 Scope and Ownership Rules (AU-S01..S08 / S09 から dev) | ✅ 新規作成 | — |
| Test Asset Shape | ✅ 新規作成 | — |
| AC Ownership Matrix (R1〜R9 全 AC) | ✅ 新規作成 | — |
| Contract Dependency Order | ✅ 新規作成 | — |
| Canonical Testable Flows (4フロー、各 convention banner + Mermaid) | ✅ 新規作成 | — |
| External Integration Flows (なし明記) | ✅ 新規作成 | — |
| State Model (AppReviewStatus 状態遷移) | ✅ 新規作成 | — |
| Assertion Rules For Test Authors | ✅ 新規作成 | — |
| QA E2E Matrix (AU-S01..S08) | ✅ 新規作成 | — |
| QA Contract E2E Matrix (13行) | ✅ 新規作成 | — |
| Developer Verification Policy | ✅ 新規作成 | — |
| Data Model Decisions | ✅ 新規作成 | — |

| OpenAPI ファイル | 旧状態 | 新状態 |
|----------------|--------|--------|
| `auth-users.yaml` | per-response tables なし・examples なし | ✅ 前 PR で更新済み |
| `auth-users-uid.yaml` GET | per-response tables なし・inline example のみ | ✅ 更新済み |
| `auth-users-uid.yaml` DELETE | per-response tables なし | ✅ 更新済み |
| `auth-users-review-preferences.yaml` | per-response tables なし | ✅ 更新済み |

---

## Iteration 1

### Reviewer: Design Narrative (Ownership & Flows)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 4フロー各々に convention banner あり。中間ノードは MySQL side effects のみ。ターミナルノードに HTTP status code。削除フローの実行順序（紐付け解除 → deleteById）が Assertion Rules に明示されており `AuthUserServiceImpl` の実装と一致。Non-gate note でステータス遷移制約なし・in-flight ゲートなしを明記 | — | — |

### Reviewer: QA (AC Completeness & Matrix)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | QA E2E Matrix (AU-S01..AU-S08) が R1〜R8 の主要 AC をカバー。QA Contract E2E Matrix が 13行で全操作のエラーケースをカバー。Scenario ID は contiguous (S01-S08)、dev-only は `—` で coverage rules のみ。既存 ScenarioTest（CreateAuthUserScenarioTest / GetAuthUserScenarioTest / DeleteAuthUserScenarioTest）が AU-S01..S08 に対応していることを確認 | — | — |

### Reviewer: Contract (OpenAPI Quality Bar)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 全 non-2xx response に per-response Internal Code Table あり。全 (HTTP status, internal error code) ペアに grouped example あり。flow diagrams・Saga prose・KVS prose なし。Business Rules summary が AC ID 参照形式で記述されている。`auth-users-uid.yaml` の旧 inline example（`example:` 形式）を `$ref` 形式の grouped example に置き換え済み | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `design.md` と3つの OpenAPI ファイルの間に矛盾なし。`auth-users-review-preferences.yaml` の `404` は R7-AC3（対応レコード不存在）と一致。`last_app_review_dialog_shown_at` の同値更新でも更新される挙動が Assertion Rules と Business Rules の両方に明記されている | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（コード → 通過テスト → OpenAPI → 既存ドキュメント）に従い監査した。`AuthUserServiceImpl` の全4メソッドを直接確認してフローを記述した。`AuthUserServiceIntegrationTest` で証明済みの振る舞い（@PrePersist/@PreUpdate / ログイン累積 / 紐付け解除）を Assertion Rules に反映した。意図した将来挙動を発明していない | — | — |

---

## Skill Checklist

### Common Quality Bar

- [x] `AC Ownership Matrix` が R1〜R9 全 AC を tateca-backend に正しく帰属させている
- [x] 4フロー各々に convention banner あり。中間ノードは DB side effects のみ。ターミナルノードに HTTP status code
- [x] Non-gate note あり（in-flight ゲートなし・ステータス遷移制約なし）
- [x] `State Model` が AppReviewStatus の状態遷移（遷移制約なし）を明示
- [x] `Assertion Rules` が初期値・ログイン記録・削除順序・@PrePersist/@PreUpdate・外部→内部エラー変換を網羅
- [x] `QA E2E Matrix` / `QA Contract E2E Matrix` が response checks + MySQL checks を含む
- [x] Scenario IDs が contiguous (AU-S01..S08 QA 所有、dev-only は `—`)
- [x] QA Question Prevention Heuristic: post-success rollback（外部 API なし・該当なし）、versioned-row（version カラムなし）、外部→内部エラー変換（GlobalExceptionHandler で明記）をすべて回答済み
- [x] 全3 OpenAPI ファイルに per-response Internal Code Tables と grouped examples あり
- [x] flow diagrams・Saga prose・KVS prose なし
- [x] `$ref` targets が正しい

### Reverse Reconstruction Hygiene Pass

- [x] `design.md` は現在の振る舞いのみを記述しており、意図した将来挙動を発明していない
- [x] コード・テスト・OpenAPI・既存ドキュメントをエビデンス優先順位に従い参照した
- [x] 旧 `create-auth-user/design.md` の内容は統合版に取り込んだ上で拡充した
- [x] 旧ファイル（get-auth-user / delete-auth-user / update-review-preferences）は design.md なしだったため新規作成扱い

---

## Final Status

- Status: `Approved`
- Remaining notes: Critical・Major finding なし。`design.md` 新規作成・`auth-users-uid.yaml` / `auth-users-review-preferences.yaml` quality-bar 準拠に更新で reverse SDD Step 2 baseline が確立。旧4ディレクトリ（create-auth-user / get-auth-user / delete-auth-user / update-review-preferences）の Step 2 以降は `auth-user` に統合済み。旧ディレクトリは Step 3 統合と合わせて整理予定。
