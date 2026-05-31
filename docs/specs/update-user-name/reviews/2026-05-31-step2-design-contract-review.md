# SDD Review Record — update-user-name / Step 2 Design + Contract

## Scope

- Feature: `update-user-name`
- Step: `Step 2 - Design + Contract (Reverse SDD)`
- Current repo: `tateca-workspace`
- Artifact(s):
  - `docs/specs/update-user-name/design.md` (全面再構築 — 旧形式から quality bar 準拠形式へ)
  - `contracts/paths/users-userId-update-user-name.yaml` (per-response Internal Code Table 追加 + Business Rules 整備)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/update-user-name/requirements.md` | R1〜R5 全 AC |
| 実装 | `UserServiceImpl.updateUserName` | findById → 403 チェック → 同値スキップ → save のフロー |
| DTO | `UpdateUserNameRequestDTO` | `name.strip()` on construct; `@NotBlank` + `@Size(max=50)` |
| Entity | `UserEntity` | `@PreUpdate` による `updated_at` 自動更新 |
| ExceptionHandler | `GlobalExceptionHandler` | `VALIDATION.FAILED`(400)・`REQUEST.MALFORMED_JSON`(400)・`REQUEST.UNSUPPORTED_MEDIA_TYPE`(415) マッピング |
| ErrorCode | `ErrorCode.java` | `USER.NOT_FOUND`(404)・`USER.FORBIDDEN`(403) |
| Scenario Test | `UpdateUserNameScenarioTest` | R1〜R5 + R3-AC1/AC2(401) フルスタックカバー |
| Controller Web Test | `UserControllerWebTest` | 200/400/403/404/415 の `error_code` アサート完備 |
| Unit Test | `UserServiceUnitTest` | 全ドメインロジックブランチカバー |
| Integration Test | `UserServiceIntegrationTest` | `@PreUpdate`・同値スキップ・マルチバイト・trim 永続化確認 |
| 既存 OpenAPI | `contracts/paths/users-userId-update-user-name.yaml` | per-response Internal Code Table 欠落を確認 |

---

## Iteration 1

### Reviewer: Architect (Flow correctness & Ownership)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | フロー正確性：DTO trim → Bean Validation → findById → 認可 → 同値判定 → save/skip の順序が `UserServiceImpl` の実装と一致。Non-gate（認証フィルター通過後の追加ゲートなし）も明記済み。単一リポジトリ・外部 API なしのシンプルな所有権構造。`@PreUpdate` による `updated_at` は実 DB を必要とするため Integration Test に適切に委譲 | — | — |

### Reviewer: Tech Lead (Feasibility & OpenAPI surface)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | `contracts/paths/users-userId-update-user-name.yaml` | 旧 OpenAPI に per-response `Internal code | Message` テーブルが存在せず quality bar を満たしていなかった | Fix | Closed |
| I1-2 | Minor | `contracts/paths/users-userId-update-user-name.yaml` | 旧 OpenAPI の `description:` が narrative 形式（Normalization・Idempotency・Authorization の散文）で contract-scope-guide の禁止コンテンツに該当していた | Fix | Closed |

### Reviewer: Test Author (Flow nodes & QA matrices)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | Mermaid `flowchart TD` に convention banner 付与済み。中間ノードに HTTP ステータスコードなし。各ターミナルノードが独立したレスポンスバリアントを表現。同値更新パスと通常更新パスが別ターミナルノードに分離済み。`Assertion Rules` に正規化順序・同値スキップ・`@PreUpdate`・認可（authUser null ケース含む）を明記。シナリオ ID は `UUN-S01..UUN-S05`（QA）、`UUN-S06..UUN-S07`（dev）、coverage rules は `—` の連続名前空間準拠 | — | — |

### Reviewer: Consumer Engineer (Request usability & Error handling)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 全 non-2xx レスポンスに per-response Internal Code Table 付与済み。Business Rules は AC ID 参照形式で簡潔。リクエスト例（`user_name: "Alice"`）追加済み。エラーコードと grouped examples が一致 | — | — |

### Reviewer: QA Question Prevention

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 外部 API なしのため post-success rollback・idempotent response・vendor body code は該当なし。`@PreUpdate` ライフサイクルは `Assertion Rules` に明記。同値スキップの `updated_at` 非変化も明記。`version` カラムなし（楽観ロック Out of Scope）。Non-gate（追加ゲートなし）を flowchart 下に明記済み。Scenario ID レイアウト（UUN-S01..S05 QA、S06..S07 dev）をスコープセクションに明記 | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `design.md` と OpenAPI の間に矛盾なし。全 `$ref` ターゲット（`USER_FORBIDDEN.yaml`・`USER_NOT_FOUND.yaml`・`VALIDATION_FAILED.yaml`・`REQUEST_MALFORMED_JSON.yaml`・`REQUEST_UNSUPPORTED_MEDIA_TYPE.yaml`・`AUTH_MISSING_CREDENTIALS.yaml`・`AUTH_INVALID_FORMAT.yaml`・`AUTH_INVALID_TOKEN.yaml`・`SYSTEM_INTERNAL_ERROR.yaml`）が既存ファイルに解決済み。外部 API なしのシンプル構造でセクション間の非対称なし | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（reverse Step 1 → コード → テスト → 既存 OpenAPI）に従い監査した。旧 `design.md` の「Planned Flow」セクション（Step 2 設計情報）を evidence-grounded HLD 形式に再構築した。フローノードは `UserServiceImpl` の実装から直接トレース。シナリオは兄弟スペック（`add-member`）の ID パターンを参考に `UUN-` プレフィックスで構成。現在の振る舞いのみを逆向きに再現しており、将来の RED 期待値を発明していない | — | — |

---

## Iteration 1 Resolution

- I1-1: 全 non-2xx レスポンス（400/401/403/404/415）に per-response `Internal code | Message` markdown table を追加
- I1-2: `description:` を Business Rules 参照形式（AC ID + `design.md` section 参照）にリファクタリング。散文を削除し contract-scope-guide 準拠に変更

---

## Skill Checklist

### Common Quality Bar

- [x] `requirements.md` の HLD インパクトが反映されている
- [x] `AC Ownership Matrix` が完備（R1〜R5 全 AC、tateca-backend が全所有）
- [x] 各所有 AC に1つのプライマリオーナーリポジトリが設定されている
- [x] リポジトリ境界・検証エントリポイント・テスト所有権が明示されている
- [x] `Consumer Interaction Notes` は不要（フロントエンド handoff 依存なし）
- [x] 複数の振る舞いパスが AC Ownership、フロー、QA/dev マトリクスで同等の粒度で文書化されている
- [x] モード依存・冪等・外部確認ベースの確定ルールが `design.md` に明示（同値スキップ・`@PreUpdate` 動作）
- [x] 自動テストが実際の検証パスでない箇所（`@PreUpdate` は Integration Test）を明示
- [x] Step 3・Step 4 所有権がガイドなしで導出可能
- [x] Step 1 から省略された技術的名称（エラーコード・field-level validation）が Step 2 で所有されている
- [x] ビジネスルール再記述・UI 設計・実装詳細が残っていない
- [x] 全 Mermaid `flowchart TD` に convention banner; 中間ノードに DB サイドエフェクトのみ; HTTP ステータスは terminal ノードのみ
- [x] Non-gate が明示（追加ゲートなし）
- [x] 外部依存なし — `External Integration Flows` セクションは「外部 API 呼び出しなし」と明記
- [x] `Assertion Rules For Test Authors` に外部→内部エラー変換・post-success rollback・versioned-row trajectory（該当なし）・同値スキップを明記
- [x] QA / dev シナリオマトリクスが response・MySQL アサーション完備
- [x] `Developer Verification Policy` が QA 再現不可ブランチを明確に記述
- [x] シナリオ ID が連続名前空間（UUN-S01..S05 QA、S06..S07 dev、coverage rules は `—`）
- [x] QA Question Prevention Heuristic 全行を確認済み（外部 API なしのため多くは該当なし）
- [x] OpenAPI に flow diagram・Saga 散文・KVS 散文・`external_ref_key` ルールが残っていない
- [x] 全 non-2xx レスポンスの `description:` に per-response `Internal code | Message` table
- [x] 全所有 `(HTTP status, internal error code)` ペアに grouped example（`$ref`）
- [x] 互換性インパクト維持（contract visible behavior 変更なし）

### Reverse Reconstruction Hygiene Pass

- [x] `design.md` は現在の振る舞いのみを反映（将来挙動を発明していない）
- [x] エビデンス優先順位（reverse Step 1 → コード → テスト → 既存 OpenAPI）に従っている
- [x] モックベースのコントローラーテストを単独の主根拠にせず、ScenarioTest/ServiceUnitTest/ServiceIntegrationTest を優先した
- [x] 兄弟スペックをパターン参照のみに使用（`add-member` の `AM-` プレフィックス構造を UUN-S## 命名の参考に）
- [x] OpenAPI に narrative content が残っていない（すべて `design.md` に移動）
- [x] 旧 `design.md` の「Planned Flow」（sequence diagram・レイヤー責務散文）を `flowchart TD` ベースの HLD 形式に再構築
- [x] 新たな設計ブランチは現在のコードエビデンスに基づいている

---

## Final Status

- Status: `Approved`
- Remaining notes: I1-1 (Closed — per-response Internal Code Table 追加)、I1-2 (Closed — description を Business Rules 参照形式に変更)。全 Critical・Major finding が Closed。`design.md` を quality bar 準拠形式に全面再構築済み。
