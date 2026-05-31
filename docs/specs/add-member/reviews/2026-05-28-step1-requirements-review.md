# SDD Review Record — add-member / Step 1 Requirements

## Scope

- Feature: `add-member`
- Step: `Step 1 - Requirements (Reverse SDD)`
- Current repo: `tateca-workspace`
- Artifact(s): `docs/specs/add-member/requirements.md`

---

## Iteration 1

### Reviewer: Senior Product Manager (Business Requirements & ACs)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Minor | `Req2` | AC の粒度がフィールドレベル（50文字、UUID形式）まで踏み込んでおり、testing.md の「per-field validation は API Contract に属する」方針と不整合だった | Fix | Closed |

### Reviewer: Senior QA (AC Completeness & Testability)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 全 Requirement の AC は `GIVEN / WHEN / THEN` 形式で記述されており、シナリオテストおよびコントローラー Web テストで網羅されている。追加の AC 抜けなし | — | — |

### Reviewer: Tech Lead (Technical Feasibility & Boundary)

- Verdict: `Needs Revision`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-2 | Major | `docs/specs/add-member/` | `design.md` が存在しない。レスポンス構造・エラーコード根拠・AC オーナーシップが未文書化。Step 2 derivability は確認できるが下流アーティファクトへの handoff が宙に浮いている | Defer | Closed |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | ユーザーストーリーと AC に矛盾なし。Scope / Out of Scope の境界が明確。Common Preconditions が全 Requirement に適用される前提として正しく記述されている。重複 AC ID・プレースホルダーなし | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位に従って参照した（コード → 通過テスト → OpenAPI → 既存ドキュメントの順）。モックのみの WebTest を主根拠とせず ScenarioTest / IntegrationTest を優先した。`MAX_GROUP_SIZE=10` は `BusinessConstants.java` で直接確認しており古い資料からのコピーではない。兄弟スペックの表現を証拠として借用していない。request-time のみのフィーチャーのため recovery/batch 境界の分離は不要 | — | — |

---

## Iteration 1 Resolution

- I1-1: `Req2` の AC を3本からビジネスレベルの1本に統合し、フィールド詳細は API Contract (OpenAPI) に委ねる旨の注釈を追加した (`docs/specs/add-member/requirements.md` 更新済み)
- I1-2: `design.md` の欠落は reverse SDD Step 2 (`sdd-reverse-design-and-contract`) の別タスクとして Defer。Step 1 単独の判定には影響しない

---

## Skill Checklist

### Common Quality Bar (`sdd-requirements/references/quality-bar.md`)

- [x] プレースホルダー・未解決マーカー・重複 AC ID・HTTP 用語・実装用語・テストルーティング漏れが AC テキストに残っていない
- [x] 全 Requirement に `GIVEN / WHEN / THEN` 形式のテスト可能な AC があり、各 AC が1つの観測可能なアウトカムを1つのスコープ・時間境界で記述している
- [x] ソース・実装・コントラクトのエビデンスはビジネス言語に変換されており、設計所有の詳細は Step 2 / Step 3 に handoff されている
- [x] サポートセクション（Scope / Out of Scope / Common Preconditions / Domain Definitions）は非自明な Step 1 価値を追加しており、セクション間および AC との重複がない
- [x] `Domain Definitions` はフィーチャー固有の用語のみ。再利用可能な用語はグロッサリーまたは STEERING へ昇格済み（本フィーチャーで新規追加なし）
- [x] Dependency Notes が現在リポジトリの振る舞いを AC から置き換えていない（本フィーチャーでは不要）
- [x] 継続・リトライ・再実行・処理済み・終端状態の表現が観測可能なビジネス境界を使っている（本フィーチャーでは該当なし）
- [x] 内部インフラのエッジケース・運用チューニング値・フィールドレベルバリデーションルールが AC に昇格していない（I1-1 で修正済み）
- [x] 未確認のビジネス挙動を推測せず、確認済みの要件が完全かつテスト可能な状態に保たれている
- [x] ユーザーストーリーとセクションの説明が全 AC のアウトカムセットを網羅している
- [x] 定量上限（MAX_GROUP_SIZE=10）と所有権の前提が現在のコード（`BusinessConstants.java`）と一致している。`design.md` 欠落によるドリフトは I1-2 として明示的に記録済み

### Reverse Reconstruction Hygiene Pass (`sdd-reverse-requirements/references/reconstruction-checks.md`)

- [x] `requirements.md` は業務可視な現在の振る舞いのみを記述しており、意図した将来挙動を発明していない
- [x] エビデンスの参照順序（コード → 通過テスト → OpenAPI → 既存ドキュメント → 兄弟スペック）に従っている
- [x] モックベースのコントローラーテストを単独の主根拠としていない（ScenarioTest / IntegrationTest を優先）
- [x] 古い資料やノートから定量制限・所有権前提をコピーせず、`BusinessConstants.java` で直接確認した
- [x] 兄弟スペックの表現を証拠として借用していない（境界パターンの問いかけ用途のみ）
- [x] request-time のみのフィーチャーのため、recovery / batch パスとの業務境界分離は不要
- [x] エビデンス間の不一致はなし（コード・テスト・実装が全 AC と整合）

---

## Final Status

- Status: `Approved`
- Remaining notes: I1-1 (Closed)、I1-2 (Closed — 2026-05-28 Step 2 reverse SDD にて `design.md` と OpenAPI を作成済み)。全 Critical・Major finding が Closed。
