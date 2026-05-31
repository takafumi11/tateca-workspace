# Requirements Document

## Introduction

本ドキュメントは、ユーザー自身の表示名更新機能（`update-user-name`）の要件を確定するための仕様書です。
目的は、ドメインとビジネスルールを明確化し、API Contract (OpenAPI) とテスト設計の基盤を提供することです。

## Scope

- 本書は、`userId` で特定されるユーザーの表示名更新におけるドメイン要件とビジネスルールを定義する。
- HTTP ステータス、JSON 形式、エンドポイント定義などのインターフェース詳細は API Contract (OpenAPI) および `design.md` で定義する。

### Out of Scope

- 楽観ロック競合
- 禁止語フィルタ
- 表示名の一意性制約（同名ユーザーの許容）
- 変更履歴の保持（監査ログ）
- レート制限

## Common Preconditions

すべての要件は以下を暗黙の前提とする。個別の Acceptance Criteria で再記載する場合は補足目的であり、省略時も前提は有効である。

- クライアントは更新対象のユーザーを識別子で指定する。
- クライアントは更新内容を構造化データで送信する。

## Domain Definitions

- **Display Name（表示名）:**
  ユーザーの表示名。UI・API いずれでもこの値がユーザーの識別表示に使用される。

- **Normalized Value（正規値）:**
  入力値に対して前後空白を除去（trim）した結果の値。
  本機能におけるバリデーション・同値比較・永続化はすべて正規値に対して行われる。

- **Same-Value Update（同値更新）:**
  現在の正規値と更新要求の正規値が一致する更新操作。

## Requirements

### Requirement 1: 表示名の更新（正常系）

**User Story:** ユーザーとして自分の表示名を変更したい。プロフィール情報を最新状態に保つため。

#### Acceptance Criteria

1. GIVEN 認証・認可済みリクエストである WHEN 有効な表示名が指定される THEN システム SHALL 対象ユーザーの表示名を正規値で更新する
2. GIVEN 表示名の更新が確定した WHEN 以降に対象ユーザーを参照する THEN システム SHALL 更新後の表示名を返す

---

### Requirement 2: 入力正規化とバリデーション

**User Story:** API クライアントとして、不正入力を早期に検知し、許容入力は一貫した形式で保存してほしい。

#### Acceptance Criteria

1. WHEN 表示名に前後空白が含まれる THEN システム SHALL 前後空白を除去した正規値で保存する
2. GIVEN リクエスト入力が不正である WHEN 表示名の更新を要求する THEN システム SHALL 入力不備として拒否する
   > フィールドレベルの詳細（必須項目、文字数制限、形式制約など）は API Contract (OpenAPI) で定義する。

---

### Requirement 3: 認証と認可

**User Story:** システム管理者として、認証されていないアクセスおよび権限のないアクセスからユーザーデータを保護したい。

#### Acceptance Criteria

1. WHEN 未認証の要求である THEN システム SHALL 更新処理を拒否する
2. WHEN 認証情報が不正である THEN システム SHALL 更新処理を拒否する
3. WHEN 認証済みだが対象ユーザーが自分自身でない THEN システム SHALL 権限不足として拒否する

---

### Requirement 4: 冪等性（同値更新）

**User Story:** API クライアントとして、同じ表示名を再送しても状態不整合を起こしたくない。

#### Acceptance Criteria

1. WHEN 正規値が現在値と同一の表示名で更新要求する THEN システム SHALL 成功として扱う
2. WHEN 同値更新が行われる THEN システム SHALL 重複レコード作成など観測可能な不整合を発生させない
3. WHEN 同値更新が行われる THEN システム SHALL 更新日時を変更しない（永続化をスキップする）

---

### Requirement 5: リソース不存在

**User Story:** API クライアントとして、対象ユーザーが存在しない場合に適切なエラーを受け取りたい。

#### Acceptance Criteria

1. WHEN 認証・認可済みだがアプリ内ユーザーレコードが存在しない THEN システム SHALL リソース不在として拒否する
