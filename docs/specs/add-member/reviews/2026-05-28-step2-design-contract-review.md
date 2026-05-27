# SDD Review Record — add-member / Step 2 Design + Contract (Reverse SDD)

## Scope

- Feature: `add-member`
- Step: `Step 2 - Design + Contract (Reverse SDD)`
- Current repo: `tateca-workspace`
- Artifact(s):
  - `docs/specs/add-member/design.md`
  - `contracts/paths/groups-groupId-members.yaml`
  - `contracts/components/examples/errors/GROUP_MAX_SIZE_REACHED.yaml` (新規作成)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/add-member/requirements.md` | R1〜R5、Domain Definitions |
| Controller 実装 | `GroupController.addMember()` | HTTP メソッド・パス・DTO・レスポンス `200 OK` |
| Service 実装 | `GroupServiceImpl.addMember()` | 処理順序・グループ不存在判定・認可チェック・サイズ上限チェック・UserEntity 永続化・UserGroupEntity 永続化 |
| DTO | `AddMemberRequestDTO.java` | `@NotBlank`・`@Size(max=50)`・`member_name` |
| 例外マッピング | `GlobalExceptionHandler.java` | BusinessRuleViolation→409、EntityNotFound→404、Forbidden→403、MethodArgumentNotValid→400(VALIDATION.FAILED) |
| Error Code | `ErrorCode.java` | `GROUP.MAX_SIZE_REACHED`・`GROUP.NOT_FOUND`・`USER.NOT_GROUP_MEMBER`・`VALIDATION.FAILED` |
| DB スキーマ | `V1__Initial_schema.sql` | `users` テーブル構造・`user_groups` 複合 PK・`auth_user_uid` FK |
| Scenario Test | `AddMemberScenarioTest.java` | R1〜R5 全 AC を MockMvc + 実 DB で検証 |
| Unit Test | `GroupServiceUnitTest.java` | 成功・GROUP_NOT_FOUND・NOT_GROUP_MEMBER・MAX_SIZE_REACHED の各ブランチ |
| Integration Test | `GroupServiceIntegrationTest.java` | DB 永続化・重複名許可・アトミック性 |
| Controller Web Test | `GroupControllerWebTest.java` | 全 HTTP ステータスコード・error_code 値 |
| 既存 OpenAPI | `contracts/paths/groups-groupId-members.yaml` | 既存パス定義（更新前） |

---

## Iteration 1

### Reviewer: Architect (Flow Correctness & Ownership)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | フロー図はコード実装と一致。3ステップ（user_groups 取得 → users INSERT → user_groups INSERT）が順序正しく表現されている。repo ownership は tateca-backend に集約されており、Supporting repo なし。State Model は join-group との境界を正しく表現している | — | — |

### Reviewer: Tech Lead (Feasibility & OpenAPI Surface)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | `contracts/paths/groups-groupId-members.yaml` | 既存の OpenAPI に per-response Internal Code Table がなく、`GROUP_MAX_SIZE_REACHED` のエラー example も存在しなかった | Fix | Closed |
| I1-2 | Minor | `contracts/paths/groups-groupId-members.yaml` | Business Rules description が不足しており、AC ID への参照もなかった | Fix | Closed |

### Reviewer: Test Author (Flows, Matrices & Scenario IDs)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | Convention banner が全 flowchart TD の前に配置されている。中間ノードは DB 副作用のみ、ターミナルノードに HTTP ステータスが集約されている。Scenario ID は AM-S01〜AM-S05（QA）、AM-S06（dev）の連続した名前空間。`Assertion Rules For Test Authors` に未参加メンバー定義・アトミック性・認可チェックルールが明示されている。非ゲート（同名重複チェックなし）が明示されている | — | — |

### Reviewer: Consumer Engineer (Request / Response Usability)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 全 non-2xx response に per-response Internal Code Table あり。grouped examples が各 (HTTP status, error code) ペアに対応している。`member_name` の validation 制約（minLength=1, maxLength=50）はスキーマレベルで定義されており、description に重複記述なし | — | — |

### Reviewer: QA Question Prevention

- Verdict: `Approved`

| Category | 回答 |
|----------|------|
| External 2xx + DB finalize failure | 本フィーチャーに外部 API なし。該当なし |
| External idempotent response | 本フィーチャーに外部 API なし。該当なし |
| Multiple internal causes → one external code | 各 error_code は単一の例外クラスに 1:1 でマップされる。変換ルール不要 |
| `version` columns touched in two steps | `users` / `user_groups` に version 列なし。楽観ロックなし |
| Removed legacy gates | 同名重複チェックなし — `Assertion Rules For Test Authors` と Mermaid 非ゲートコメントで明示済み |
| External vendor body codes | 外部 API 依存なし。該当なし |
| Best-effort side effects | Redis 操作なし。該当なし |
| Async / accepted semantics | 同期レスポンス。該当なし |
| `external_ref_key` and similar | 本フィーチャーに external_ref_key なし |
| Daily-limit / window semantics | 本フィーチャーに日次制限なし |
| Scenario ID layout | AM-S01〜AM-S05 (QA)、AM-S06〜 (dev)。連続した名前空間。Step 2 Scope and Ownership Rules に明記済み |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `design.md` と OpenAPI に矛盾なし。narrative content（フロー図・State Model・Data Model）は design.md に残り、OpenAPI に漏れていない。`$ref` ターゲットはすべて実在するファイルを参照。requirements.md のビジネスルール再記述はなく、AC ID 参照のみ | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位に従い、コード実装 → テスト → DB スキーマ → 既存 OpenAPI の順で参照した。モックのみの WebTest は補足証拠として扱い、ScenarioTest / IntegrationTest を主根拠とした。兄弟スペックは境界パターン確認のみに使用した。発明された設計要素はない | — | — |

---

## Iteration 1 Resolution

- I1-1: `GROUP_MAX_SIZE_REACHED` エラー example ファイルを新規作成し（`contracts/components/examples/errors/GROUP_MAX_SIZE_REACHED.yaml`）、全 non-2xx response に per-response `Internal code | Message` table を追加した
- I1-2: OpenAPI `description:` に Business Rules セクションを追加し、AC ID と `design.md` セクション参照を明記した

---

## Skill Checklist

### Common Quality Bar

- [x] `requirements.md` の HLD インパクトが捕捉されている
- [x] `AC Ownership Matrix` が完成している
- [x] 各 owned AC に一つの primary owner repo が設定されている
- [x] repo 境界・verification entrypoint・test ownership が明示されている
- [x] `Consumer Interaction Notes` は frontend handoff が不要なため省略（単純な同期 REST API）
- [x] 複数の振る舞いパスが matrix・flows・data sections で同等の粒度でドキュメント化されている
- [x] Step 3 ownership・contract dependency order・Step 4 ownership が derivable
- [x] Step 1 から削除された技術的マッピングが Step 2 で明示的に所有されている
- [x] ビジネスルール再記述・UI 設計・実装詳細が残っていない

### `design.md` Narrative Half

- [x] `Canonical Testable Flows` が全主要パスを DB 副作用付きで網羅
- [x] 全 Mermaid `flowchart TD` に convention banner あり；中間ノードは DB 副作用のみ；HTTP ステータスはターミナルノードのみ；persistence pre-state が明示的に分岐
- [x] 非ゲート（同名重複チェックなし）が明示的に記述されている
- [x] `External Integration Flows` — 外部依存なし（明示的に記述済み）
- [x] `External Outcome Mapping Snapshot` — 外部依存なし（該当なし）
- [x] `Assertion Rules For Test Authors` が必要なすべてのルールをカバー
- [x] `QA E2E Matrix` と `QA Contract E2E Matrix` が全 QA 所有シナリオを response・MariaDB assertions 付きでカバー
- [x] `Developer Verification Policy` が QA 再現不可能なブランチを明確に記述
- [x] Scenario IDs が連続名前空間規則に従っている（QA: AM-S01〜S05、dev: AM-S06〜）
- [x] `State Model` がドキュメント化されている
- [x] QA Question Prevention Heuristic ウォークスルー完了

### Internal API OpenAPI Contract Half

- [x] 本リポジトリのコントラクト所有権が明示されている
- [x] `requirements.md` と `design.md` のコントラクト境界の振る舞いが反映されている
- [x] Request/response schema が owned contract と一致
- [x] Validation rules がスキーマレベルで完全（`minLength`・`maxLength`・`required`）
- [x] Status codes と error codes が owned surface について完全
- [x] 各 non-2xx response `description:` に `Internal code | Message` table あり
- [x] 各 `(HTTP status, internal error code)` ペアに grouped example あり
- [x] フロー図・Saga prose・KVS prose・`external_ref_key` ルールが OpenAPI に残っていない
- [x] トップレベル "Error Code List" テーブルなし（per-response table が正規ソース）
- [x] Contract-visible async/polling/idempotency — 本フィーチャーは同期応答のみ（該当なし）
- [x] 互換性インパクトが保持されている（既存の path・status codes に破壊的変更なし）
- [x] 設計の重複・実装の漏れなし
- [x] `$ref` ターゲットがすべて正しい
- [x] Error examples が referenced responses と整合

---

## Final Status

- Status: `Approved`
- Remaining notes: Step 2 の両ハーフ（`design.md` + OpenAPI）について全 Critical・Major finding が Closed。Reverse SDD の Step 2 baseline として確立。
