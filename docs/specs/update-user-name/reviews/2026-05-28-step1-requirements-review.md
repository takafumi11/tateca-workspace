# SDD Review Record — update-user-name / Step 1 Requirements

## Scope

- Feature: `update-user-name`
- Step: `Step 1 - Requirements (Reverse SDD)`
- Current repo: `tateca-workspace`
- Artifact(s): `docs/specs/update-user-name/requirements.md`

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| 実装 | `UserServiceImpl.updateUserName` | findById → 403 チェック（authUser.uid 比較）→ 同値スキップ → save の実行パス |
| DTO | `UpdateUserNameRequestDTO` | `name.strip()` on construct; `@NotBlank` + `@Size(max=50)` |
| Scenario Test | `UpdateUserNameScenarioTest` | R1〜R5 全 AC + Req3-AC1/AC2（401）を MockMvc フルスタックでカバー |
| Controller Web Test | `UserControllerWebTest` | 200/400/403/404/415 の error_code アサート完備 |
| OpenAPI | `contracts/paths/users-userId-update-user-name.yaml` | PATCH /users/{userId}; 200/400/403/404/415/500 |
| 既存 `requirements.md` | `docs/specs/update-user-name/requirements.md` | R1〜R5（R2 に field-level AC 3本が残存） |

---

## Iteration 1

### Reviewer: Senior Product Manager (Business Requirements & ACs)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Minor | `Req2` | `Processing Order` セクション（正規化→バリデーションの順序）と AC2/AC3（空値・長さ超過の field-level 詳細）が Step 2 設計情報と field-level contract 情報を Step 1 に持ち込んでおり、testing.md「per-field validation は API Contract に属する」方針と不整合だった | Fix | Closed |
| I1-2 | Minor | Introduction / Domain Definitions | 機能名・ドキュメント内用語は「ユーザー」で統一する（エンドポイント名 `update-user-name` および iOS との整合を保つ）。一時的に「メンバー」へ統一を試みたが、`update-group-name` との対称性および既存 API 命名との整合から「ユーザー」に戻した | Fix | Closed |

### Reviewer: Senior QA (AC Completeness & Testability)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 全 Requirement の AC は `GIVEN / WHEN / THEN` 形式で記述されており、ScenarioTest で全 AC がカバーされている。R2 の field-level 詳細は API Contract に委ねる方針に変更後も AC の testability は維持される。Req3-AC1/AC2（未認証・不正認証）はフルスタック ScenarioTest でカバー済みであり AC の抜けなし | — | — |

### Reviewer: Tech Lead (Technical Feasibility & Boundary)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `design.md` が既存であり Step 2 derivability に問題なし。Req3-AC3 の「対象メンバーが自分自身でない」は `authUser.uid` 比較によって実現されており、R5-AC1 の「メンバーレコードが存在しない」は `findById` の空結果でカバー。両ケースともに ServiceImpl の実装と一致 | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | ユーザーストーリーと AC に矛盾なし。Out of Scope（楽観ロック・禁止語・一意制約・変更履歴・レート制限）の境界が明確。Common Preconditions が全 Requirement に適用される前提として正しく記述されている。重複 AC ID・プレースホルダーなし。R4 の3本 AC（成功扱い・不整合なし・`updated_at` 非更新）は別々の観測可能アウトカムであり分割が適切 | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位に従って参照した（コード → 通過テスト → OpenAPI → 既存ドキュメントの順）。モックのみの WebTest を主根拠とせず ScenarioTest / ServiceUnitTest / ServiceIntegrationTest を優先した。`name.strip()` は `UpdateUserNameRequestDTO` のコンストラクタで直接確認、同値比較は `UserServiceImpl` で直接確認済み。兄弟スペックの表現を証拠として借用していない。request-time のみのフィーチャーのため recovery/batch 境界の分離は不要 | — | — |

---

## Iteration 1 Resolution

- I1-1: `Req2` から `Processing Order` セクションを削除し、AC2/AC3 をビジネスレベルの1本（`GIVEN リクエスト入力が不正である WHEN ... THEN 入力不備として拒否する`）に統合。フィールド詳細は API Contract (OpenAPI) に委ねる旨の注釈を追加した
- I1-2: 機能名・ドキュメント内用語は「ユーザー」で統一することを確認。`update-group-name` との対称性および iOS エンドポイント後方互換性を考慮し、`update-user-name` ディレクトリ名・ファイル名はそのまま維持する

---

## Skill Checklist

### Common Quality Bar (`sdd-requirements/references/quality-bar.md`)

- [x] プレースホルダー・未解決マーカー・重複 AC ID・HTTP 用語・実装用語・テストルーティング漏れが AC テキストに残っていない
- [x] 全 Requirement に `GIVEN / WHEN / THEN` 形式のテスト可能な AC があり、各 AC が1つの観測可能なアウトカムを1つのスコープ・時間境界で記述している
- [x] ソース・実装・コントラクトのエビデンスはビジネス言語に変換されており、設計所有の詳細は Step 2 / Step 3 に handoff されている
- [x] サポートセクション（Scope / Out of Scope / Common Preconditions / Domain Definitions）は非自明な Step 1 価値を追加しており、セクション間および AC との重複がない
- [x] `Domain Definitions` はフィーチャー固有の用語のみ（Display Name・Normalized Value・Same-Value Update）。再利用可能な用語はグロッサリーまたは STEERING へ昇格済み（本フィーチャーで新規追加なし）
- [x] Dependency Notes が現在リポジトリの振る舞いを AC から置き換えていない（本フィーチャーでは不要）
- [x] 継続・リトライ・再実行・処理済み・終端状態の表現が観測可能なビジネス境界を使っている（R4-AC1〜AC3: 同値更新を成功扱い / 不整合なし / `updated_at` 非更新 の3アウトカムに分離）
- [x] 内部インフラのエッジケース・運用チューニング値・フィールドレベルバリデーションルールが AC に昇格していない（I1-1 で修正済み）
- [x] 未確認のビジネス挙動を推測せず、確認済みの要件が完全かつテスト可能な状態に保たれている
- [x] ユーザーストーリーとセクションの説明が全 AC のアウトカムセットを網羅している
- [x] 定量上限（`@Size(max=50)`）と所有権の前提が現在のコード（`UpdateUserNameRequestDTO`）と一致している

### Reverse Reconstruction Hygiene Pass (`sdd-reverse-requirements/references/reconstruction-checks.md`)

- [x] `requirements.md` は業務可視な現在の振る舞いのみを記述しており、意図した将来挙動を発明していない
- [x] エビデンスの参照順序（コード → 通過テスト → OpenAPI → 既存ドキュメント → 兄弟スペック）に従っている
- [x] モックベースのコントローラーテストを単独の主根拠としていない（ScenarioTest / ServiceUnitTest を優先）
- [x] 古い資料やノートから定量制限・所有権前提をコピーせず、`UpdateUserNameRequestDTO` で直接確認した
- [x] 兄弟スペックの表現を証拠として借用していない（境界パターンの問いかけ用途のみ）
- [x] request-time のみのフィーチャーのため、recovery / batch パスとの業務境界分離は不要
- [x] エビデンス間の不一致はなし（コード・テスト・実装が全 AC と整合）

---

## Final Status

- Status: `Approved`
- Remaining notes: I1-1 (Closed — R2 field-level AC を統合)、I1-2 (Closed — 「ユーザー」で統一し `update-user-name` 命名を維持)。全 Critical・Major finding が Closed。
