# Design Document (HLD) — update-user-name

## Step 2 Scope and Ownership Rules

- `design.md` は QA が E2E テストを記述するための唯一の HLD 情報源である。すべての主要フローノードは MySQL の変化と変化しない項目を明記する。
- QA ツールエンベロープ: HTTP クライアント（`restClient`）、DB クライアント（`dbClient`）、ステージング環境。外部依存なし（`UserServiceImpl` は外部 API を呼ばない）。
- QA が担当するブランチ: QA ツールエンベロープで再現可能なブランチ（正常更新・同値更新・認証・認可・存在確認・バリデーション）はすべて QA マトリクスに配置する。
- 開発者専用ブランチ: プロダクト内部の失敗注入（`@PreUpdate` JPA ライフサイクルなど）が必要なブランチは開発者マトリクスに移動する。
- 共有シナリオルール: 共有ビジネスシナリオは1回だけ定義し、QA E2E（ステージング）と開発者 Testcontainers ローカルで再利用する。
- QA は `UUN-S01..UUN-S05` を所有する。開発者専用具体的シナリオは `UUN-S06` から続ける。

## Test Asset Shape

- 共有シナリオセット: `UpdateUserNameScenariosTests`（interface）
- QA 自己サービス E2E スイート: `UpdateUserNameE2ETest`（staging executor）
- 開発者ローカルセーフティネット: `UpdateUserNameTestcontainersTest`（Testcontainers executor）、`UserServiceUnitTest`、`UserServiceIntegrationTest`

## AC Ownership Matrix

| Requirement / AC | Business trigger | Primary owner repo | Supporting repo(s) | Verification entrypoint | Contract / interface | Test owner |
|------------------|------------------|--------------------|--------------------|-------------------------|----------------------|------------|
| R1-AC1 | 認証・認可済みリクエストで有効な表示名を送信 | tateca-backend | — | `PATCH /users/{userId}` + `GET /groups/{groupId}` | `users-userId-update-user-name.yaml` | tateca-backend |
| R1-AC2 | 更新後に対象ユーザーを参照 | tateca-backend | — | `GET /groups/{groupId}` | `users-userId-update-user-name.yaml` | tateca-backend |
| R2-AC1 | 前後空白を含む表示名を送信 | tateca-backend | — | `PATCH /users/{userId}` レスポンス + `GET /groups/{groupId}` | `users-userId-update-user-name.yaml` | tateca-backend |
| R2-AC2 | 不正入力（空・null・長さ超過など）を送信 | tateca-backend | — | `PATCH /users/{userId}` 400 レスポンス | `users-userId-update-user-name.yaml` | tateca-backend |
| R3-AC1 | 未認証リクエスト | tateca-backend | — | `PATCH /users/{userId}` 401 レスポンス | `users-userId-update-user-name.yaml` | tateca-backend |
| R3-AC2 | 不正認証情報リクエスト | tateca-backend | — | `PATCH /users/{userId}` 401 レスポンス | `users-userId-update-user-name.yaml` | tateca-backend |
| R3-AC3 | 認証済みだが他ユーザーのリソースへアクセス | tateca-backend | — | `PATCH /users/{userId}` 403 レスポンス | `users-userId-update-user-name.yaml` | tateca-backend |
| R4-AC1 | 同値で更新要求 | tateca-backend | — | `PATCH /users/{userId}` 200 レスポンス | `users-userId-update-user-name.yaml` | tateca-backend |
| R4-AC2 | 同値更新後に対象ユーザーを参照 | tateca-backend | — | `GET /groups/{groupId}` | `users-userId-update-user-name.yaml` | tateca-backend |
| R4-AC3 | 同値更新時の `updated_at` 非更新 | tateca-backend | — | `GET /groups/{groupId}` レスポンス `updated_at` フィールド | `users-userId-update-user-name.yaml` | tateca-backend |
| R5-AC1 | 認証・認可済みだがユーザーレコード不存在 | tateca-backend | — | `PATCH /users/{userId}` 404 レスポンス | `users-userId-update-user-name.yaml` | tateca-backend |

## Contract Dependency Order and Step Routing

1. tateca-backend が `contracts/paths/users-userId-update-user-name.yaml` を所有し固定する
2. Step 3 (black-box tests) オーナー: tateca-backend（`UpdateUserNameScenariosTests`、`UserControllerWebTest`）
3. Step 4 (internal tests) オーナー: tateca-backend（`UserServiceUnitTest`、`UserServiceIntegrationTest`）

## Canonical Testable Flows

### Request Flow

Convention: HTTP status codes appear only on terminal response nodes. Intermediate nodes describe DB side effects only.

```mermaid
flowchart TD
    A([PATCH /users/{userId}]) --> B[Step1: DTO deserialize\nMySQL: no write\n\nname.strip applied in constructor]
    B --> C{Bean Validation\nblank? length > 50?}
    C -->|invalid| T400[400 VALIDATION.FAILED\nor REQUEST.MALFORMED_JSON\nerrors array present for validation\nerrors absent for malformed JSON]
    C -->|valid| D[Step2: findById userId\nMySQL: SELECT users\n]
    D -->|not found| T404[404 USER.NOT_FOUND]
    D -->|found| E{authUid == user.authUser.uid?}
    E -->|mismatch or authUser null| T403[403 USER.FORBIDDEN]
    E -->|match| F{newName == user.name?}
    F -->|same value| T200S[200 OK\nUserResponse — current state\nMySQL: no write, updated_at unchanged\n]
    F -->|different value| G[Step3: user.setName + repository.save\nMySQL: UPDATE users SET name, updated_at via @PreUpdate\n]
    G --> T200U[200 OK\nUserResponse — updated state]
```

**Non-gate note:** このフローには認証フィルター通過後の追加ゲート（in-flight チェック、残高確認など）は存在しない。唯一のドメインゲートは `authUid == resourceOwnerUid` の認可チェックと `userId` の存在確認である。

## External Integration Flows

本フィーチャーは外部 API 呼び出しを行わない。MySQL（`users` テーブル）のみを使用する。

## State Model

`users.name` フィールドは更新可能な単一値であり、ライフサイクル状態（FIXED/RECOVERABLE 等）を持たない。同値更新の場合は永続化をスキップするため、`updated_at` は変化しない。

## Assertion Rules For Test Authors

- **正規化順序:** DTO コンストラクタが `name.strip()` を実行してから Bean Validation が評価される。50文字制約はトリム後の値に対して適用される。テストは「前後空白付き50文字」を送信して成功することで正規化→バリデーション順序を証明できる。
- **同値更新スキップ:** `user.name.equals(newName)` が `true` の場合、`repository.save()` は呼ばれない。JPA `@PreUpdate` は発火しないため `updated_at` は変化しない。これは `UserServiceUnitTest`（`save()` 非呼び出し確認）と `UserServiceIntegrationTest`（DB 上の `updated_at` 非変化確認）の両方で証明する。
- **`@PreUpdate` と `updated_at`:** `repository.save()` が呼ばれた場合、JPA `@PreUpdate` コールバックが `updated_at = Instant.now()` を設定する。この振る舞いは実 DB を必要とするため `UserServiceIntegrationTest` でのみ検証する。
- **認可チェック:** `user.authUser` が `null` の場合、`resourceOwnerUid` は `null` になり `authUid.equals(null)` は `false` のため `ForbiddenException` が投げられる。これは `UserServiceUnitTest` の `WhenNotAuthorized — authUser null` ケースで証明済み。
- **外部→内部エラー変換:** `GlobalExceptionHandler` が `MethodArgumentNotValidException` を `VALIDATION.FAILED`（400）に、`HttpMessageNotReadableException` を `REQUEST.MALFORMED_JSON`（400）に、`HttpMediaTypeNotSupportedException` を `REQUEST.UNSUPPORTED_MEDIA_TYPE`（415）にマッピングする。これらは `UserControllerWebTest` で証明する。
- **post-success rollback:** 本フィーチャーは外部 API を呼ばないため、外部 `2xx` 後のロールバックシナリオは存在しない。
- **versioned-row:** `users` テーブルに `version` カラムは存在しない（楽観ロックは Out of Scope）。

## QA E2E Matrix

| QA E2E method | Source | Staging prerequisite or harness | Response checks | MySQL checks |
|---------------|--------|--------------------------------|-----------------|----------------|-------------|
| `uunS01_r1Ac1Ac2_updateNameAndPersist` | UUN-S01 / R1-AC1, R1-AC2 | 認証済みユーザー + グループ作成 | `200` / `$.name == "Charlie"` | `users.name == "Charlie"` via GET group |
| `uunS02_r2Ac1_trimWhitespace` | UUN-S02 / R2-AC1 | 認証済みユーザー + グループ作成 | `200` / `$.name == "Charlie"`（前後空白除去） | `users.name == "Charlie"` via GET group |
| `uunS03_r3Ac1Ac2_rejectUnauthenticated` | UUN-S03 / R3-AC1, R3-AC2 | 認証済みユーザー + グループ作成 | `401` / `$.error_code` が `AUTH.MISSING_CREDENTIALS` or `AUTH.INVALID_FORMAT` or `AUTH.INVALID_TOKEN` | MySQL: no write |
| `uunS04_r4Ac1Ac2Ac3_sameValueIdempotent` | UUN-S04 / R4-AC1, R4-AC2, R4-AC3 | 認証済みユーザー + グループ作成 | `200` / `$.name == "Alice"` / `updated_at` 不変 | `users.updated_at` 変化なし via GET group |
| `uunS05_r5Ac1_notFound` | UUN-S05 / R5-AC1 | 認証済みユーザー | `404` / `$.error_code == "USER.NOT_FOUND"` | MySQL: no write |

## QA Contract E2E Matrix

| QA contract E2E method | Source | Staging prerequisite or harness | Response checks | MySQL checks |
|------------------------|--------|--------------------------------|-----------------|----------------|-------------|
| `shouldReturn400WithValidationFailedAndErrorsArray` | R2-AC2 / `VALIDATION.FAILED` (blank) | 認証済みユーザー + グループ | `400` / `$.error_code == "VALIDATION.FAILED"` / `$.errors` 存在 | no write |
| `shouldReturn400WhenUserNameExceedsMaxLength` | R2-AC2 / `VALIDATION.FAILED` (長さ超過) | 認証済みユーザー + グループ | `400` / `$.error_code == "VALIDATION.FAILED"` | no write |
| `shouldReturn400WhenUserNameIsNull` | R2-AC2 / `VALIDATION.FAILED` (null) | 認証済みユーザー + グループ | `400` / `$.error_code == "VALIDATION.FAILED"` | no write |
| `shouldReturn400WithMalformedJson` | `REQUEST.MALFORMED_JSON` | 認証済みユーザー + グループ | `400` / `$.error_code == "REQUEST.MALFORMED_JSON"` / `$.errors` 不在 | no write |
| `shouldReturn403WhenNotResourceOwner` | R3-AC3 / `USER.FORBIDDEN` | 2ユーザー + グループ | `403` / `$.error_code == "USER.FORBIDDEN"` | no write |
| `shouldReturn415WhenContentTypeMissing` | `REQUEST.UNSUPPORTED_MEDIA_TYPE` | 認証済みユーザー + グループ | `415` / `$.error_code == "REQUEST.UNSUPPORTED_MEDIA_TYPE"` | no write |

## Developer Verification Policy

### Shared Scenario Mirroring

QA E2E マトリクスが共有ビジネス動作の唯一の正規シナリオマトリクスである。QA が所有するすべての共有シナリオ（UUN-S01..UUN-S05）は Testcontainers + MockMvc を使用してローカルでも実行可能であり、同じレスポンス・MySQL アウトカムを証明しなければならない。

### Dev-Only Verification

| Scenario ID | Verification item | Why it is developer-owned | Expected local proof |
|-------------|-------------------|---------------------------|----------------------|
| UUN-S06 | `repository.save()` 呼び出し後に JPA `@PreUpdate` が `updated_at` を更新すること | 実 DB・JPA ライフサイクルが必要 | `UserServiceIntegrationTest` |
| UUN-S07 | 同値更新時に `repository.save()` をスキップすることで `updated_at` が DB 上で変化しないこと | 実 DB・save スキップの確認が必要 | `UserServiceIntegrationTest` |
| — | `UserServiceImpl.updateUserName` の各ブランチ（USER_NOT_FOUND・USER_FORBIDDEN・同値スキップ・通常 save）の例外・save 非呼び出し確認 | モック注入が必要 | `UserServiceUnitTest` |
| — | 全 OpenAPI エラーコードのマッピング（`VALIDATION.FAILED`・`REQUEST.MALFORMED_JSON`・`REQUEST.UNSUPPORTED_MEDIA_TYPE` など） | ExceptionHandler マッピングは Controller Web Test で網羅 | `UserControllerWebTest` |

### Local Proof Selection Rule

- **共有シナリオ（UUN-S01..UUN-S05）:** `UpdateUserNameTestcontainersTest`（Testcontainers + MockMvc）
- **コントラクト・バリデーション・エラーマッピング:** `UserControllerWebTest`（`@WebMvcTest`）
- **ドメインロジック分岐:** `UserServiceUnitTest`（Mockito）
- **DB 永続化・JPA ライフサイクル:** `UserServiceIntegrationTest`（Testcontainers）

## Data Model Decisions

- 既存 `users` テーブルの `name` カラム（`varchar(50)`）を更新する。スキーマ変更なし。
- `updated_at` は JPA `@PreUpdate` コールバックによって自動更新される。同値更新時は `save()` を呼ばないため `@PreUpdate` は発火せず、`updated_at` は変化しない。
- `authUser` リレーション（`auth_users` テーブル）は更新対象外。認可チェックの参照のみに使用する。
- `users.name` の一意制約なし。同名ユーザーの許容は `requirements.md` の Out of Scope に明記済み。
