# SDD Review Record — transaction / Step 2 Design + Contract (Reverse SDD)

## Scope

- Feature: `transaction`（createTransaction / getTransactionDetail / updateTransaction / deleteTransaction / getTransactionHistory / getSettlements）
- Step: `Step 2 - Design + Contract (Reverse SDD)`
- Artifact(s):
  - `docs/specs/transaction/design.md` (新規作成)
  - `contracts/paths/groups-groupId-transactions.yaml` (更新)
  - `contracts/paths/groups-groupId-transactions-transactionId.yaml` (更新)
  - `contracts/paths/groups-groupId-transactions-history.yaml` (更新)
  - `contracts/paths/groups-groupId-transactions-settlement.yaml` (更新)
  - `contracts/components/examples/errors/TRANSACTION_NOT_FOUND.yaml` (新規)
  - `contracts/components/examples/errors/EXCHANGE_RATE_NOT_FOUND.yaml` (新規)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/transaction/requirements.md` | R1〜R21 全 AC |
| 実装 | `TransactionServiceImpl` | 6メソッド全実装 |
| Controller | `TransactionController` | 6エンドポイント・HTTP メソッド |
| Entity | `TransactionHistoryEntity` / `TransactionObligationEntity` | フィールド・@PrePersist / @PreUpdate |
| 定数 | `BusinessConstants.MAX_TRANSACTION_OBLIGATIONS = 9` | 義務リスト上限 |
| バリデーション | `CreateTransactionRequestDTO` / `UpdateTransactionRequestDTO` / `TransactionDetailsValidator` | Bean Validation アノテーション・排他チェック |
| DTO | `CreateTransactionResponseDTO` / `TransactionHistoryResponseDTO` / `TransactionSettlementResponseDTO` | レスポンス形状 |
| GlobalExceptionHandler | `IllegalArgumentException` → 400 / `EntityNotFoundException` → 404 | エラーマッピング |
| Scenario Tests | 各 ScenarioTest | R1〜R21 各シナリオをカバー |
| Controller Web Test | `TransactionControllerWebTest` | 全ステータスコード + エラーコードアサート |
| 旧 OpenAPI | 4ファイル | per-response tables・examples なし（quality-bar 未準拠） |

---

## Gap Analysis（旧コントラクトの quality bar 違反）

| ファイル | 違反項目 | 対処 |
|---------|---------|------|
| 全4ファイル | `description:` にフロー図・設計詳細が混入 | 統合版では Business Rules 一覧 + `design.md` 参照に置き換え |
| 全4ファイル | 非 2xx response に per-response `Internal code | Message` テーブルなし | 全 response に追加 |
| 全4ファイル | `(HTTP status, internal error code)` ペアごとの grouped example なし | 各 status × error code に example を追加 |
| `groups-groupId-transactions.yaml` / `groups-groupId-transactions-transactionId.yaml` | `TRANSACTION.NOT_FOUND` / `EXCHANGE_RATE.NOT_FOUND` の error example ファイルが未存在 | 新規作成 |
| `groups-groupId-transactions-transactionId.yaml` delete | 404 response が記述されていなかった（旧実装は 204 を返すため未定義） | R14 に従い 404 を追加（実装変更前提） |

---

## Iteration 1

### Reviewer: Senior Product Manager / QA

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | 全4 OpenAPI ファイル | per-response `Internal code | Message` テーブルが存在しない。quality bar 必須 | Fix | Closed |
| I1-2 | Major | 全4 OpenAPI ファイル | `(HTTP status, error code)` ペアごとの grouped example が存在しない | Fix | Closed |
| I1-3 | Major | `TRANSACTION_NOT_FOUND.yaml` / `EXCHANGE_RATE_NOT_FOUND.yaml` | error example ファイルが存在しない | Fix | Closed |
| I1-4 | Major | `groups-groupId-transactions-transactionId.yaml` DELETE | R14-AC1 に従い `404 TRANSACTION.NOT_FOUND` が必要だが旧コントラクトに未定義 | Fix | Closed |
| I1-5 | Minor | 全4 OpenAPI ファイル `description:` | フロー図・設計詳細・DB 操作詳細が OpenAPI に混入。`design.md` に移設すべき | Fix | Closed |
| I1-6 | Minor | `design.md` Assertion Rules | 返済取引の更新拒否は `REPAYMENT.NOT_UPDATABLE` という専用 error_code が現行実装に存在しないことを明記する必要がある | Fix | Closed |

### Reviewer: Tech Lead

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 6操作は同一 `TransactionController` / `TransactionServiceImpl` に実装されており統合は自然。`deleteTransaction` の R14-AC1（存在確認追加）は実装変更が必要であることを `design.md` Non-gate notes と Assertion Rules の両方で明記済み。`TRANSACTION.NOT_FOUND` error_code が `ErrorCode` enum に未定義であることも Assertion Rules で明記済み | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | TX-S01..TX-S17 の QA 範囲と TX-S18..TX-S20 の dev 範囲が contiguous namespace として定義されている。シナリオ ID に gaps・sub-ID なし。QA Contract E2E Matrix の全行が QA ツールエンベロープで再現可能（ペイロード・DB 作成で制御可能）。coverage rules は `—` を使用。外部 API なし、post-success rollback なし、versioned-row なしを Assertion Rules で明記済み | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（コード → 通過テスト → OpenAPI → 既存ドキュメント）に従い監査した。`TransactionServiceImpl` の全メソッドを直接確認して AC を導出した。`DeleteTransactionScenarioTest` のコメントを conflict の根拠として採用し、R14（存在確認追加）は新仕様として design.md に記述した | — | — |

---

## Iteration 1 Resolution

- I1-1: 全4ファイルの非 2xx response に `Internal code | Message` テーブルを追加
- I1-2: 全4ファイルに grouped error examples を追加（`$ref` による参照）
- I1-3: `TRANSACTION_NOT_FOUND.yaml` / `EXCHANGE_RATE_NOT_FOUND.yaml` を新規作成
- I1-4: DELETE `/{transactionId}` に `404 TRANSACTION.NOT_FOUND` response を追加
- I1-5: 全4ファイルの `description:` からフロー図・設計詳細を削除し Business Rules 形式に統一
- I1-6: `design.md` Assertion Rules に「返済取引の更新拒否は `IllegalArgumentException` → 400 であり `REPAYMENT.NOT_UPDATABLE` error_code は現行実装に未定義」を明記

---

## Skill Checklist

- [x] The common Step 2 quality bar in `platform/skills/sdd-design-and-contract/references/quality-bar.md` is satisfied
- [x] Reverse Step 1 exists and is sufficient to anchor Step 2
- [x] Code, current OpenAPI, controller behavior, tests, ADRs, and persistence or interface evidence were inventoried first
- [x] `design.md` reflects current behavior only, including DB side effects per node, explicit non-gates, Assertion Rules covering external-to-internal conversion / post-success rollback / versioned-row trajectory, QA matrices, and developer policy
- [x] Every reconstructed Mermaid `flowchart TD` is preceded by the convention banner; intermediate nodes carry only DB side effects; HTTP status codes appear only on terminal response nodes; persistence pre-state is branched explicitly; conditional best-effort writes are stated as conditionals
- [x] Scenario IDs follow the contiguous-namespace convention: QA owns `TX-S01..TX-S17`, dev owns `TX-S18..TX-S20`, coverage rules carry `—`, no gaps, no sub-IDs
- [x] QA Question Prevention Heuristic walkthrough complete: 外部 API なし / post-success rollback なし / versioned-row なし / 端数調整ロジックは Dev-Only に配置 / non-gates を全フローで明記
- [x] OpenAPI reflects current behavior only and contains no flow diagrams, Saga prose, or top-level Error Code List tables
- [x] Each non-2xx response `description:` carries an `Internal code | Message` table
- [x] Each owned `(HTTP status, internal error code)` pair has its own grouped example referenced via `$ref`
- [x] Review loop is complete: triage recorded, fixes applied for all Critical and Major findings, re-review done, record saved

---

## Final Status

- Status: `Approved`
- Remaining notes: Critical・Major finding なし。`design.md` 新規作成・4 OpenAPI ファイル quality-bar 準拠に更新・2 error example 新規作成で reverse SDD Step 2 baseline が確立。`deleteTransaction` の存在確認追加（R14-AC1）は Step 4 (Reverse TDD) で実装する。`TRANSACTION.NOT_FOUND` error_code の `ErrorCode` enum 追加も Step 4 で対応。
