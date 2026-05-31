# SDD Review Record — create-auth-user / Step 2 Design + Contract (Reverse SDD)

## Scope

- Feature: `create-auth-user`
- Step: `Step 2 - Design + Contract (Reverse SDD)`
- Current repo: `tateca-workspace` / `tateca-backend`
- Artifact(s):
  - `docs/specs/create-auth-user/design.md` (新規作成)
  - `contracts/paths/auth-users.yaml` (更新 — per-response Internal Code Tables + grouped examples 追加)
  - `contracts/components/examples/errors/AUTH_USER_EMAIL_DUPLICATE.yaml` (新規作成)
  - `contracts/components/examples/errors/AUTH_USER_NOT_FOUND.yaml` (新規作成)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/create-auth-user/requirements.md` | R1〜R3 全 AC |
| 実装 | `AuthUserServiceImpl.createAuthUser` | existsByEmail → build（name=""・loginCount=1・PENDING・lastLoginTime=now()）→ save |
| Controller | `AuthUserController.createAuthUser` | `@UId` UID 取得 + `@Valid @RequestBody` + 201 返却 |
| Entity | `AuthUserEntity` | `@PrePersist` (createdAt/updatedAt)、uid/name/email/appReviewStatus/totalLoginCount/lastLoginTime |
| DTO | `CreateAuthUserRequestDTO` | `@NotBlank` + `@Size(max=255)` on email |
| Response DTO | `AuthUserResponseDTO` | 全フィールドを Tokyo 時間文字列で返却 |
| Exception Handler | `GlobalExceptionHandler` | MethodArgumentNotValid → VALIDATION.FAILED(400)、HttpMessageNotReadable → REQUEST.MALFORMED_JSON(400)、HttpMediaTypeNotSupported → REQUEST.UNSUPPORTED_MEDIA_TYPE(415)、DuplicateResourceException → 409 |
| Auth Filter | `TatecaAuthenticationFilter` | MISSING_CREDENTIALS / INVALID_FORMAT / INVALID_TOKEN → 401 |
| Scenario Test | `CreateAuthUserScenarioTest` | R1-AC1〜AC3、R2 (blank/255超)、R3-AC1 (重複) を Testcontainers でカバー |
| Controller Web Test | `AuthUserControllerWebTest` | 201/400/409/415 アサート完備 |
| 既存 OpenAPI | `contracts/paths/auth-users.yaml` | POST /auth/users 200/400/401/409/415/500（per-response table・examples なし） |
| 兄弟スペック | `update-user-name/design.md` | 構造パターンの参照 |

---

## Step 2 Scope Decision

- `design.md` が存在しなかった → 新規作成
- `auth-users.yaml` に per-response Internal Code Tables と grouped examples が欠如 → 更新
- `auth-users-uid.yaml`（GET / DELETE）は `get-auth-user` / `delete-auth-user` フィーチャーのスコープのため今回の変更対象外

---

## Gap Analysis

| design.md 必須セクション | 状態 | 対処 |
|--------------------------|------|------|
| Step 2 Scope and Ownership Rules | ✅ 新規作成 | — |
| Test Asset Shape | ✅ 新規作成 | — |
| AC Ownership Matrix (R1-AC1〜R3-AC1) | ✅ 新規作成 | — |
| Contract Dependency Order | ✅ 新規作成 | — |
| Canonical Testable Flows (convention banner + Mermaid) | ✅ 新規作成 | — |
| External Integration Flows | ✅ 新規作成（なし明記） | — |
| State Model | ✅ 新規作成 | — |
| Assertion Rules For Test Authors | ✅ 新規作成 | — |
| QA E2E Matrix | ✅ 新規作成（CAU-S01..S03） | — |
| QA Contract E2E Matrix | ✅ 新規作成（6行） | — |
| Developer Verification Policy | ✅ 新規作成 | — |
| Data Model Decisions | ✅ 新規作成 | — |

| OpenAPI 必須要素 | 旧状態 | 新状態 |
|-----------------|--------|--------|
| 400 per-response Internal Code Table | なし | VALIDATION.FAILED / REQUEST.MALFORMED_JSON ✅ |
| 400 grouped examples | なし | validationFailed / malformedJson ✅ |
| 401 per-response Internal Code Table | なし | MISSING_CREDENTIALS / INVALID_FORMAT / INVALID_TOKEN ✅ |
| 401 grouped examples | なし | missingCredentials / invalidFormat / invalidToken ✅ |
| 409 per-response Internal Code Table | なし | AUTH_USER.EMAIL_DUPLICATE ✅ |
| 409 grouped example | なし | emailDuplicate ✅ |
| 415 per-response Internal Code Table | なし | REQUEST.UNSUPPORTED_MEDIA_TYPE ✅ |
| 415 grouped example | なし | unsupportedMediaType ✅ |
| Business Rules summary | なし | email uniqueness + initial values ✅ |
| request body example | なし | createUser example ✅ |

---

## Iteration 1

### Reviewer: Design Narrative (Ownership & Flows)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | AC Ownership Matrix が R1-AC1〜R3-AC1 を正しく tateca-backend に帰属させている。Verification entrypoint が `POST /auth/users` + `GET /auth/users/{uid}` で設計証明可能。Mermaid flowchart TD に convention banner あり。中間ノードは MySQL side effect のみ。ターミナルノードに HTTP status code が記載されている | — | — |

### Reviewer: QA (AC Completeness & Matrix)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | QA E2E Matrix (CAU-S01..CAU-S03) が R1-AC1〜AC3、R3-AC1 をカバー。QA Contract E2E Matrix が R2-AC1（4パターン）・MALFORMED_JSON・415 の 6行をカバー。Scenario ID は contiguous (S01-S03)、dev-only は `—` で coverage rules のみ。`CreateAuthUserScenarioTest` が実際にこれらのシナリオを Testcontainers でカバー済みであることを確認 | — | — |

### Reviewer: Contract (OpenAPI Quality Bar)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 全 non-2xx response (400/401/409/415) に per-response Internal Code Table あり。全 (HTTP status, internal error code) ペアに grouped example あり。flow diagrams・Saga prose・KVS prose なし。Business Rules summary が AC ID 参照形式で記述されている。旧 narrative description を Quality-bar 準拠に置き換え済み | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `design.md` と `auth-users.yaml` の間に矛盾なし。`auth-users-uid.yaml` は別フィーチャーのため今回対象外（get-auth-user / delete-auth-user の reverse SDD で対応予定）。`CreateAuthUserRequest.yaml` スキーマの `minLength:1` + `maxLength:255` が `@NotBlank` + `@Size(max=255)` と一致。孤立エラー例ファイルなし | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（コード → 通過テスト → OpenAPI → 既存ドキュメント）に従い監査した。`AuthUserServiceImpl` の実装を直接確認してフロー・初期値ルールを記述した。兄弟スペック（`update-user-name/design.md`）は構造パターンの参照のみに使用した。意図した将来挙動を発明していない | — | — |

---

## Skill Checklist

### Common Quality Bar (`sdd-design-and-contract/references/quality-bar.md`)

- [x] HLD impact が `requirements.md` から取り込まれている
- [x] `AC Ownership Matrix` が完備されている
- [x] 各 owned AC に1つのプライマリオーナーリポジトリが割り当てられている
- [x] リポジトリ境界・検証エントリポイント・テストオーナーシップが明示されている
- [x] Step 3 / Step 4 ownership が `design.md` から導出可能
- [x] `Canonical Testable Flows` が convention banner + Mermaid flowchart TD 形式で記述されている
- [x] 中間ノードは DB side effects のみ。HTTP status codes はターミナルノードのみ
- [x] Non-gate note あり（in-flight ゲート・残高確認などなし）
- [x] `Assertion Rules For Test Authors` が初期値・@PrePersist・外部→内部エラー変換をカバー
- [x] `QA E2E Matrix` / `QA Contract E2E Matrix` が response checks + MySQL checks を含む
- [x] `Developer Verification Policy` が shared scenario mirroring + dev-only table + local proof rule をカバー
- [x] Scenario IDs が contiguous namespace (CAU-S01..S03 QA 所有、dev-only は `—`)
- [x] QA Question Prevention Heuristic: post-success rollback（外部 API なし・該当なし）、versioned-row（version カラムなし）、external-to-internal error conversion（GlobalExceptionHandler で明記）をすべて回答済み
- [x] OpenAPI に flow diagrams・Saga prose・KVS prose なし
- [x] 各 non-2xx response `description:` に per-response `Internal code | Message` table あり
- [x] 各 `(HTTP status, internal error code)` ペアに grouped example あり
- [x] `$ref` targets が正しい

### Reverse Reconstruction Hygiene Pass

- [x] `design.md` は現在の振る舞いのみを記述しており、意図した将来挙動を発明していない
- [x] コード・テスト・OpenAPI・既存ドキュメントをエビデンス優先順位に従い参照した
- [x] 兄弟スペックは構造パターンの参照のみに使用し、証拠として借用していない
- [x] `auth-users-uid.yaml`（get/delete）は今回のスコープ外であることを明記した

---

## Final Status

- Status: `Approved`
- Remaining notes: Critical・Major finding なし。`design.md` 新規作成・`auth-users.yaml` quality-bar 準拠に更新・`AUTH_USER_EMAIL_DUPLICATE.yaml` / `AUTH_USER_NOT_FOUND.yaml` error example 新規作成で reverse SDD Step 2 baseline が確立。`auth-users-uid.yaml` は別フィーチャー（get-auth-user / delete-auth-user）のため今回対象外。
