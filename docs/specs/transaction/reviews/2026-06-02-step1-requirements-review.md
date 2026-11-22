# SDD Review Record — transaction / Step 1 Requirements (Reverse SDD)

## Scope

- Feature: `transaction`（旧: `create-transaction` / `get-transaction-detail` / `update-transaction` / `delete-transaction` / `get-transaction-history` / `get-transaction-settlement` を統合）
- Step: `Step 1 - Requirements (Reverse SDD)`
- Current repo: `tateca-workspace`
- Artifact(s): `docs/specs/transaction/requirements.md`

---

## 統合判断

6フィーチャーを `transaction` に統合した理由:
- 同一コントローラー（`TransactionController`）・同一サービス（`TransactionServiceImpl`）への操作
- 同一ドメインエンティティ（`TransactionHistoryEntity` / `TransactionObligationEntity`）
- Domain Definitions（取引・立替・返済・為替レート代替・精算など）が複数ファイルに重複
- 6フィーチャーが取引ライフサイクル（作成→取得→更新→削除→履歴→精算）として一体で読める

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| 実装 | `TransactionServiceImpl` | 6メソッド全実装（createTransaction / getTransactionDetail / deleteTransaction / updateTransaction / getTransactionHistory / getSettlements） |
| Controller | `TransactionController` | POST・GET (detail)・PUT・DELETE・GET (history)・GET (settlement) |
| Entity | `TransactionHistoryEntity` | フィールド定義・@PrePersist・@PreUpdate |
| Entity | `TransactionObligationEntity` | 義務・返済記録の構造 |
| 定数 | `BusinessConstants.MAX_TRANSACTION_OBLIGATIONS = 9` | 義務リスト上限 |
| バリデーション | `TransactionDetailsValidator` | 立替/返済詳細の排他チェック |
| Scenario Tests | `CreateTransactionScenarioTest` | R1〜R7 |
| Scenario Tests | `GetTransactionDetailScenarioTest` | R6〜R7 |
| Scenario Tests | `UpdateTransactionScenarioTest` | R8〜R12 |
| Scenario Tests | `DeleteTransactionScenarioTest` | R13〜R14（+ 実装 conflict 確認） |
| Scenario Tests | `GetTransactionHistoryScenarioTest` | R15〜R16 |
| Scenario Tests | `GetTransactionSettlementScenarioTest` | R17〜R20 |
| Controller Web Test | `TransactionControllerWebTest` | 全操作のステータスコード・エラーマッピング |
| OpenAPI | `groups-groupId-transactions.yaml` / `groups-groupId-transactions-transactionId.yaml` 等 | エンドポイント・ステータスコード |
| 旧 requirements | `create-transaction/requirements.md` | Processing Order・field-level AC 混入を確認 |
| 旧 requirements | `delete-transaction/requirements.md` | Processing Order・実装 conflict 確認 |
| 旧 requirements | 残4ファイル | Processing Order 混入・WHEN のみ AC 混入を確認 |

---

## Gap Analysis（旧ファイルの quality bar 違反と実装 conflicts）

| ファイル / 箇所 | 違反・conflict | 対処 |
|--------------|--------------|------|
| 全6ファイル `Processing Order` セクション | 実行順序（存在確認→保存など）は Step 2 設計情報。Step 1 からは削除し `design.md` Canonical Flows に委ねる | 統合版では Processing Order セクションを削除 |
| `create-transaction` R4〜R6 / `update-transaction` R4 | `WHEN ～ THEN` のみで GIVEN なし — GIVEN/WHEN/THEN 形式不完全。field-level AC（UUID 形式・文字数・金額下限・通貨コード形式・日付形式・件数上下限）が Step 1 に混入 | 統合 R4・R11・R14・R16・R20 で business-level 1本に統合し注釈で API Contract に委ねる |
| `get-transaction-detail` R3 / `delete-transaction` R2 / `get-transaction-history` R2 / `get-transaction-settlement` R5 | 同上 field-level WHEN-only AC | 統合 R7-AC2・R14-AC1・R16-AC1・R20-AC1 で business-level 1本に統合 |
| `delete-transaction` R3-AC1 | **実装 conflict**: `requirements.md` では「リソース不在として拒否する（404）」と記述されているが、実装（`transactionRepository.deleteById`）は存在しない ID でも例外を投げず 204 を返す。`DeleteTransactionScenarioTest` も 204 を期待している | 統合版では R13 から「存在しない取引の削除」ケースを除外。conflict を Review I1-1 に記録 |
| `update-transaction` R2-AC1 | 返済取引の更新は `IllegalArgumentException` → 400 を返す（`UpdateTransactionScenarioTest` で `isBadRequest()` を確認）。旧 requirements では「拒否する」とのみ記述 | 統合 R9-AC1 では「拒否する」のみ記述し、HTTP status は API Contract（OpenAPI）に委ねる |
| 全6ファイル Out of Scope | "現在の実装では～" 実装詳細参照が混入 | 統合版では "実装では" 接頭辞を削除し事実のみ残す |
| Domain Definitions | 6ファイルに重複（取引・立替・返済・義務・為替レート代替） | 1箇所に集約 |

---

## Iteration 1

### Reviewer: Senior Product Manager

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | `delete-transaction` R3-AC1 / 統合 R13 | **実装 conflict**: `deleteTransaction` は存在しない取引 ID でも例外を投げず 204 を返す。旧 requirements は 404 を期待していたが `DeleteTransactionScenarioTest` は 204 を正とする。Reverse SDD では実装に合わせ、存在しない取引の削除ケースを R13 から除外する | Fix | Closed |
| I1-2 | Major | 全6ファイル R4 / R2 等 | field-level AC（UUID 形式・文字数・金額下限・通貨コード形式・日付形式・件数上下限）が Step 1 に混入。quality bar「business-level 1本・field-level は API Contract へ」違反 | Fix | Closed |
| I1-3 | Major | 全6ファイル `WHEN ～ THEN` AC | GIVEN がない AC が多数存在 — GIVEN/WHEN/THEN 形式不完全 | Fix | Closed |
| I1-4 | Minor | 全6ファイル `Processing Order` | 実行順序は Step 2 設計情報。Step 1 から削除し `design.md` に委ねる | Fix | Closed |
| I1-5 | Minor | 全6ファイル Out of Scope | "現在の実装では～" 実装詳細参照を削除し事実のみ残す | Fix | Closed |
| I1-6 | Minor | Domain Definitions | 6ファイルに重複する用語を1箇所に集約する | Fix | Closed |

### Reviewer: Senior QA

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | R1〜R20 の全 AC が GIVEN/WHEN/THEN 形式でテスト可能。`DeleteTransactionScenarioTest` の現実装挙動（204）に合わせ R13 から conflict ケースを除外したことで、テストと AC の整合性が保たれている | — | — |

### Reviewer: Tech Lead

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 6操作は同一 `TransactionController` / `TransactionServiceImpl` に実装されており統合は自然。R9（返済取引の更新制限）は `IllegalArgumentException` → 400 で実装されているが HTTP status は API Contract に委ねる形で Step 1 では「拒否する」のみ記述しており適切。為替レート解決（R3・R10）は作成・更新の両方で共通ロジックを使用しており、対称的に記述できている | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | R1〜R20 に重複 AC ID・プレースホルダーなし。Domain Definitions は1箇所に集約されており重複なし。R3 と R10（為替レート解決）を作成・更新で分離しているのはライフサイクルの対称性を保つため適切。R15-AC5（取引概要に含まれる情報）は旧 `get-transaction-history` R1-AC5 から維持されており、過去に確認された業務可視項目として重要 | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（コード → 通過テスト → OpenAPI → 既存ドキュメント）に従い監査した。`TransactionServiceImpl` の全メソッドを直接確認して AC を導出した。`DeleteTransactionScenarioTest` のコメント（"現実装では存在確認なし"）を conflict の根拠として採用した。兄弟スペックを証拠として借用していない | — | — |

---

## Iteration 1 Resolution

- I1-1: `delete-transaction` の存在しない取引への 404 ケースは実装が 204 を返すため、R13 から除外。conflict を Review に記録した
- I1-2: 全バリデーション要件を business-level 1本の AC（`GIVEN リクエスト入力が不正である WHEN ～ THEN システム SHALL 入力不備として拒否する`）に統合し、フィールド詳細は API Contract に委ねる旨の注釈を追加した
- I1-3: 全 AC を GIVEN/WHEN/THEN 形式に統一した
- I1-4: 全6ファイルの Processing Order セクションを統合版から除外した
- I1-5: Out of Scope から "現在の実装では～" 接頭辞を削除した
- I1-6: Domain Definitions を1箇所に集約した

---

## Skill Checklist

### Common Quality Bar

- [x] プレースホルダー・未解決マーカー・重複 AC ID・HTTP 用語・実装用語・テストルーティング漏れが AC テキストに残っていない
- [x] 全 Requirement に GIVEN/WHEN/THEN 形式のテスト可能な AC があり、各 AC が1つの観測可能なアウトカムを記述している
- [x] ソース・実装・コントラクトのエビデンスはビジネス言語に変換されており、設計所有の詳細は Step 2 / Step 3 に handoff されている
- [x] サポートセクション（Scope / Out of Scope / Common Preconditions / Domain Definitions）は非自明な Step 1 価値を追加しており、セクション間および AC との重複がない
- [x] `Domain Definitions` はフィーチャー固有の用語のみ
- [x] 内部インフラのエッジケース・運用チューニング値・フィールドレベルバリデーションルールが AC に昇格していない
- [x] ユーザーストーリーとセクションの説明が全 AC のアウトカムセットを網羅している

### Reverse Reconstruction Hygiene Pass

- [x] `requirements.md` は業務可視な現在の振る舞いのみを記述しており、意図した将来挙動を発明していない
- [x] エビデンスの参照順序（コード → 通過テスト → OpenAPI → 既存ドキュメント）に従っている
- [x] 旧6ファイルの quality bar 違反をすべて修正した上で統合している
- [x] 実装 conflict（`delete-transaction` R3）は発明せず明示的に記録した上で AC から除外している
- [x] 統合により失われた業務可視情報はなし（全 AC が統合版で維持されている）

---

---

## Iteration 2

開発者の意思決定により、`deleteTransaction` は存在しない取引 ID を受け取った場合に 404 を返す実装に変更する方針が確定した。これは新たな正常仕様として Step 1 に反映する。

- Reviewer: Tech Lead / Sanity
- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I2-1 | Major | `requirements.md` R13（削除正常系） | I1-1 で除外した「存在しない取引の削除時は 404」を新仕様として R14（取引削除のリソース不存在）に追加する | Fix | Closed |
| I2-2 | Minor | R14〜R20（旧番号） | R14 追加に伴いR14〜R20 を R15〜R21 に繰り下げる | Fix | Closed |

## Iteration 2 Resolution

- I2-1: `Requirement 14: 取引削除のリソース不存在` を新規追加（AC1: 存在しない取引の削除要求はリソース不在として拒否する）
- I2-2: 旧 R14〜R20 を R15〜R21 に番号繰り下げ

---

## Final Status

- Status: `Approved`
- Remaining notes: I1-1〜I1-6・I2-1〜I2-2 すべて Closed。`deleteTransaction` の存在確認を追加する方針が確定し R14 に反映済み。旧6ファイルは `transaction/requirements.md`（R1〜R21）に統合済み。
