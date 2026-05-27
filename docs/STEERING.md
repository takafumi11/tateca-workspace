# STEERING — Tateca Workspace

Tateca の SDD / 契約 / API Docs を素早く把握するための「地図」。
新規参画の開発者や、別の Cursor セッションがコンテキストを得るために参照する。

実装・デプロイの詳細は `tateca-backend` を参照する。

## Document Map

```
README.md                    — 人間向けの玄関。概要 + Getting Started + リンク集
AGENTS.md / CLAUDE.md        — AI エージェント向け入口
docs/STEERING.md             — プロジェクトの地図（本文書）
docs/sdd-process.md          — SDD プロセスガイド
docs/sdd-reverse-process.md  — Reverse SDD プロセスガイド
docs/testing.md              — テスト戦略・テストタイプ定義
docs/frontend-sdd.md         — フロントエンド面がある場合の SDD 拡張
docs/review-record-template.md — SDD レビュー記録テンプレート
docs/specs/{feature}/        — フィーチャー別の要件・設計
openapi.yaml                 — API Contract エントリポイント
contracts/                   — Tateca API Contract source files
```

---

## Product Overview

**Tateca** は、グループ経費管理 (Group Expense Management) の REST API バックエンド。

複数ユーザーが共有するグループ内で、経費 (Expense)・貸し借り (Loan)・返済 (Repayment) を記録し、多通貨に対応した精算 (Settlement) を算出する。

| 項目 | 値 |
|------|-----|
| API 名 | Tateca API |
| バージョン | 1.0.0 |
| API ドキュメント | https://docs.tateca.net |
| 本番 API | https://api.tateca.net |
| ステージング API | https://staging-api.tateca.net |

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Language | Java | 25 |
| Framework | Spring Boot | 3.5.8 |
| Build Tool | Gradle (Kotlin DSL) | 9.2.0 |
| Database | MySQL | 8 |
| DB Migration | Flyway | (Spring Boot managed) |
| Authentication | Firebase Authentication | Admin SDK 9.4.2 |
| Resilience | Resilience4j | 2.2.0 |
| Observability | Logstash + Micrometer + Better Stack | — |
| Container Registry | GitHub Container Registry (GHCR) | — |
| Deployment | Railway (image-based) | — |
| API Documentation | Redocly (OpenAPI 3.1) | — |

バージョンの実態は `gradle/libs.versions.toml` を参照。

---

## Domain Model

### Core Entities

```
┌──────────────┐     N:M      ┌──────────────┐
│  AuthUser    │──────────────│    Group      │
│  (Firebase)  │  UserGroup   │              │
└──────┬───────┘              └──────┬───────┘
       │ 1:1                         │ 1:N
┌──────┴───────┐              ┌──────┴───────┐
│    User      │              │ Transaction  │
│  (Profile)   │              │   History    │
└──────────────┘              └──────┬───────┘
                                     │ 1:N
                              ┌──────┴───────┐
                              │ Transaction  │
                              │  Obligation  │
                              └──────────────┘

┌──────────────┐     1:N      ┌──────────────┐
│   Currency   │──────────────│ ExchangeRate │
└──────────────┘              └──────────────┘
```

| Entity | 役割 |
|--------|------|
| `AuthUserEntity` | Firebase UID と紐づく認証ユーザー。レビュー設定を保持 |
| `UserEntity` | 表示名などのプロファイル情報 |
| `GroupEntity` | ユーザーが所属するグループ。招待コード (invite code) でメンバーを追加 |
| `UserGroupEntity` | ユーザーとグループの多対多中間テーブル |
| `TransactionHistoryEntity` | 経費・貸し借り・返済の履歴 |
| `TransactionObligationEntity` | トランザクションに対する各ユーザーの負担額 |
| `CurrencyEntity` | 通貨マスタ (JPY, USD, EUR 等) |
| `ExchangeRateEntity` | 日次の為替レート |

### Transaction Types

| Type | 説明 |
|------|------|
| `EXPENSE` | グループ経費 (割り勘) |
| `LOAN` | メンバー間の貸し借り |
| `REPAYMENT` | 借りたお金の返済 |

---

## Architecture Overview

### Layered Architecture

```
HTTP Request
    │
    ▼
┌─────────────────────────┐
│  Security Filter        │  Firebase JWT / API Key 認証
│  (TatecaAuthFilter)     │
├─────────────────────────┤
│  Controller             │  HTTP ⇔ DTO 変換、Bean Validation
├─────────────────────────┤
│  Service                │  ビジネスロジック、ドメインルール
├─────────────────────────┤
│  Repository             │  JPA によるデータアクセス
├─────────────────────────┤
│  MySQL                  │  永続化 (Flyway マイグレーション)
└─────────────────────────┘
```

### Authentication

2 つの認証方式がパスベースでルーティングされる:

| パス | 認証方式 | 用途 |
|------|----------|------|
| `/internal/**` | X-API-Key ヘッダー | Lambda / EventBridge からの内部呼び出し |
| その他 | Firebase JWT (Bearer token) | フロントエンドからのユーザー操作 |

- Constant-time API key comparison to prevent timing attacks
- `@UId` annotation extracts user ID or system ID from the security context

### External Integrations

| 連携先 | 用途 | 頻度 |
|--------|------|------|
| Firebase Authentication | ユーザー認証・トークン検証 | リクエストごと |
| Exchange Rate API | 為替レート取得 | 日次 (00:01 UTC) |
| Better Stack | ログ集約・モニタリング | リアルタイム |

---

## API Endpoints Overview

### User / Auth

| Method | Path | 機能 |
|--------|------|------|
| POST | `/auth/users` | 認証ユーザー登録 |
| GET | `/auth/users/{uid}` | 認証ユーザー取得 |
| DELETE | `/auth/users/{uid}` | 認証ユーザー削除 |
| PATCH | `/auth/users/review-preferences` | レビュー設定更新 |
| PUT | `/users/{userId}` | 表示名更新 |

### Group

| Method | Path | 機能 |
|--------|------|------|
| POST | `/groups` | グループ作成 |
| GET | `/groups/list` | グループ一覧取得 |
| GET | `/groups/{groupId}` | グループ詳細取得 |
| PUT | `/groups/{groupId}` | グループ名更新 |
| POST | `/groups/{groupId}/members` | メンバー追加 (招待コード) |
| DELETE | `/groups/{groupId}/members/{userUuid}` | メンバー削除 |
| DELETE | `/groups/{groupId}/users/{userUuid}` | グループ脱退 |

### Transaction

| Method | Path | 機能 |
|--------|------|------|
| POST | `/groups/{groupId}/transactions` | トランザクション作成 |
| GET | `/groups/{groupId}/transactions/{transactionId}` | トランザクション詳細取得 |
| PUT | `/groups/{groupId}/transactions/{transactionId}` | トランザクション更新 |
| DELETE | `/groups/{groupId}/transactions/{transactionId}` | トランザクション削除 |
| GET | `/groups/{groupId}/transactions/history` | 取引履歴一覧取得 |
| GET | `/groups/{groupId}/transactions/settlement` | 精算情報取得 |

### Exchange Rate

| Method | Path | 機能 |
|--------|------|------|
| GET | `/exchange-rate/{date}` | 指定日の為替レート取得 |
| POST | `/internal/exchange-rates` | 為替レート更新 (内部 API) |

---

## CI/CD

### Overview

```
PR → CI (OpenAPI Lint + Preview)
Main merge → CD (API Contract Deploy to GitHub Pages)
```

Backend test/build/deploy は `tateca-backend` の CI/CD が担当する。

### CI Pipeline (`.github/workflows/ci.yml`)

**Trigger:** Pull requests to `main`

| Job | Description |
|-----|-------------|
| `openapi-lint` | Redocly による API Contract (OpenAPI) 検証 |
| `openapi-preview` | API Contract プレビューをブランチ名パスで GitHub Pages にデプロイ |
| `cleanup-preview` | PR close 時に gh-pages からプレビューフォルダを削除 |

API Contract Preview URL: `https://<owner>.github.io/<repo>/<branch-name>/`

### CD Pipeline (`.github/workflows/cd.yml`)

**Trigger:** Push to `main` (= PR マージ) + workflow_dispatch

| Job | Description |
|-----|-------------|
| `deploy-docs` | API Contract ドキュメントを GitHub Pages ルートにデプロイ |

### Deployment

- **Docs site:** GitHub Pages (`docs.tateca.net` via `CNAME`)
- **Backend runtime:** `tateca-backend` の GHCR + Railway

---

## SDD Feature Specifications

実装済み機能の仕様書は `docs/specs/` 配下にフィーチャー単位で管理:

| Feature | 仕様ディレクトリ |
|---------|-----------------|
| 認証ユーザー作成 | `docs/specs/create-auth-user/` |
| 認証ユーザー取得 | `docs/specs/get-auth-user/` |
| 認証ユーザー削除 | `docs/specs/delete-auth-user/` |
| レビュー設定更新 | `docs/specs/update-review-preferences/` |
| 表示名更新 | `docs/specs/update-user-name/` |
| グループ作成 | `docs/specs/create-group/` |
| グループ一覧取得 | `docs/specs/get-group-list/` |
| グループ詳細取得 | `docs/specs/get-group-detail/` |
| グループ名更新 | `docs/specs/update-group-name/` |
| グループ参加 | `docs/specs/join-group/` |
| グループ脱退 | `docs/specs/leave-group/` |
| メンバー追加 | `docs/specs/add-member/` |
| メンバー削除 | `docs/specs/remove-member/` |
| トランザクション作成 | `docs/specs/create-transaction/` |
| トランザクション詳細取得 | `docs/specs/get-transaction-detail/` |
| トランザクション更新 | `docs/specs/update-transaction/` |
| トランザクション削除 | `docs/specs/delete-transaction/` |
| 取引履歴取得 | `docs/specs/get-transaction-history/` |
| 精算情報取得 | `docs/specs/get-transaction-settlement/` |
| 為替レート取得 | `docs/specs/get-exchange-rate/` |
| 為替レート更新 | `docs/specs/update-exchange-rate/` |
