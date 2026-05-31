# SDD Review Record — create-auth-user / Step 1 Requirements (Reverse SDD)

## Scope

- Feature: `create-auth-user`
- Step: `Step 1 - Requirements (Reverse SDD)`
- Current repo: `tateca-workspace`
- Artifact(s): `docs/specs/create-auth-user/requirements.md`

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| 実装 | `AuthUserServiceImpl.createAuthUser` | email 重複チェック → エンティティ build（name=""、loginCount=1、PENDING、lastLoginTime=now()）→ save |
| DTO | `CreateAuthUserRequestDTO` | `@NotBlank` + `@Size(max=255)` on email |
| Entity | `AuthUserEntity` | uid / name / email / createdAt / updatedAt / lastLoginTime / totalLoginCount / appReviewStatus / lastAppReviewDialogShownAt + `@PrePersist` で createdAt / updatedAt 自動設定 |
| Response DTO | `AuthUserResponseDTO` | 全フィールドを Tokyo 時間文字列に変換して返却 |
| Scenario Test | `CreateAuthUserScenarioTest` | R1-AC1〜AC3 (作成・初期値・lastLoginTime)、R2-AC1/AC2 (空・空白・255超)、R3-AC1 (重複) を MockMvc + Testcontainers でカバー |
| Controller Web Test | `AuthUserControllerWebTest` | 201/400/409/415 の status + error_code アサート完備 |
| OpenAPI | `contracts/paths/auth-users.yaml` | POST /auth/users; 201/400/401/409/415/500 |
| 既存 `requirements.md` | `docs/specs/create-auth-user/requirements.md` | R1〜R3（R2 に field-level AC 2本が残存） |

---

## Step 1 Scope Decision

- `requirements.md` は既存だが、R2 に field-level validation ACs（4条件箇条書き + 255文字上限）が残存しており quality bar 違反
- 実装は tateca-backend の `POST /auth/users` のみ
- `create-auth-user` スコープ: 認証ユーザー作成のみ（get / delete / update は別フィーチャー）

---

## Gap Analysis

| エビデンス | 既存 requirements.md 状態 | Gap | 対処 |
|-----------|--------------------------|-----|------|
| R1-AC1: 作成成功 | "バリデーションを通過した" — テストルーティング漏れ | Minor | Fix |
| R1-AC2: 初期値 (loginCount=1, PENDING) | ✅ | なし | — |
| R1-AC3: lastLoginTime 設定 | ✅ | なし | — |
| R2: 入力バリデーション | AC1（4条件箇条書き）+ AC2（255文字超過）— field-level ACs が Step 1 に混入 | Major | Fix |
| R3-AC1: メール重複拒否 | ✅ | なし | — |
| Out of Scope: "現在の実装では～" | 実装詳細が Step 1 に混入 | Minor | Fix |

---

## Iteration 1

### Reviewer: Senior Product Manager (Business Requirements & ACs)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | `Req2` | AC1（4条件箇条書き）と AC2（255文字上限）が field-level validation rules を Step 1 に持ち込んでおり、quality bar「business-level 1本に統合・field-level は API Contract へ」に違反 | Fix | Closed |
| I1-2 | Minor | `Req1-AC1` | "バリデーションを通過した" はテストルーティング漏れ。business AC は "メールアドレスを指定して" で十分 | Fix | Closed |
| I1-3 | Minor | `Out of Scope` | "現在の実装では空白チェックと長さチェックのみ" / "現在の実装ではトリムせずそのまま保存される" — 実装詳細が Step 1 に混入。"現在の実装では" を削除して事実のみ残す | Fix | Closed |

### Reviewer: Senior QA (AC Completeness & Testability)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | R1-AC1〜AC3 / R2-AC1 / R3-AC1 はすべて `GIVEN / WHEN / THEN` 形式でテスト可能。`CreateAuthUserScenarioTest` が全 AC を Testcontainers フルスタックでカバー済み。R2 の field-level 詳細を API Contract に委ねても testability は維持される | — | — |

### Reviewer: Tech Lead (Technical Feasibility & Boundary)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | create-auth-user スコープは `POST /auth/users` のみ。get/delete/update は別フィーチャー。R1-AC3（lastLoginTime）は `AuthUserEntity.build()` 時に `Instant.now()` で設定されており実装と一致。R2-AC1 の "入力不備として拒否する" は `@NotBlank + @Size` の動作を business 言語で正しく表現している | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | ユーザーストーリーと AC に矛盾なし。Out of Scope の境界（メール形式検証・表示名・Firebase アカウント作成・通知・トリム）が明確。R1〜R3 に重複 AC ID・プレースホルダーなし。R1-AC2 と R1-AC3 は別々の観測可能アウトカム（初期値セット・lastLoginTime セット）であり分割適切 | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（コード → 通過テスト → OpenAPI → 既存ドキュメント）に従い監査した。`CreateAuthUserScenarioTest`（Testcontainers）を主根拠とし、`AuthUserControllerWebTest`（mock-based）を補足的に参照した。兄弟スペックの表現を証拠として借用していない。request-time のみのフィーチャーのため recovery/batch 境界の分離は不要 | — | — |

---

## Iteration 1 Resolution

- I1-1: `Req2` の AC1（4条件箇条書き）と AC2（255文字超過）を1本の business-level AC に統合し、フィールド詳細は API Contract に委ねる旨の注釈を追加した
- I1-2: `R1-AC1` の "バリデーションを通過した" を "メールアドレスを指定して" に変更し、テストルーティング漏れを除去した
- I1-3: `Out of Scope` の "現在の実装では" 接頭辞を削除し、実装詳細参照を排除した

---

## Skill Checklist

### Common Quality Bar (`sdd-requirements/references/quality-bar.md`)

- [x] プレースホルダー・未解決マーカー・重複 AC ID・HTTP 用語・実装用語・テストルーティング漏れが AC テキストに残っていない
- [x] 全 Requirement に `GIVEN / WHEN / THEN` 形式のテスト可能な AC があり、各 AC が1つの観測可能なアウトカムを1つのスコープ・時間境界で記述している
- [x] ソース・実装・コントラクトのエビデンスはビジネス言語に変換されており、設計所有の詳細は Step 2 / Step 3 に handoff されている
- [x] サポートセクション（Scope / Out of Scope / Common Preconditions / Domain Definitions）は非自明な Step 1 価値を追加しており、セクション間および AC との重複がない
- [x] `Domain Definitions` はフィーチャー固有の用語のみ。再利用可能な用語はグロッサリーまたは STEERING へ昇格済み（本フィーチャーで新規なし）
- [x] Dependency Notes が現在リポジトリの振る舞いを AC から置き換えていない（本フィーチャーでは不要）
- [x] 継続・リトライ・再実行・処理済み・終端状態の表現が観測可能なビジネス境界を使っている（本フィーチャーは request-time のみ）
- [x] 内部インフラのエッジケース・運用チューニング値・フィールドレベルバリデーションルールが AC に昇格していない（I1-1 で修正済み）
- [x] 未確認のビジネス挙動を推測せず、確認済みの要件が完全かつテスト可能な状態に保たれている
- [x] ユーザーストーリーとセクションの説明が全 AC のアウトカムセットを網羅している
- [x] 定量上限（`@Size(max=255)`）と所有権の前提が現在のコード（`CreateAuthUserRequestDTO`）と一致しており、contract 委任で一貫している

### Reverse Reconstruction Hygiene Pass (`sdd-reverse-requirements/references/reconstruction-checks.md`)

- [x] `requirements.md` は業務可視な現在の振る舞いのみを記述しており、意図した将来挙動を発明していない
- [x] エビデンスの参照順序（コード → 通過テスト → OpenAPI → 既存ドキュメント → 兄弟スペック）に従っている
- [x] モックベースのコントローラーテストを単独の主根拠としていない（`CreateAuthUserScenarioTest` を優先）
- [x] 古い資料やノートから定量制限・所有権前提をコピーせず、`CreateAuthUserRequestDTO` で直接確認した
- [x] 兄弟スペックの表現を証拠として借用していない
- [x] request-time のみのフィーチャーのため、recovery / batch パスとの業務境界分離は不要
- [x] エビデンス間の不一致はなし（コード・テスト・実装が全 AC と整合）

---

## Final Status

- Status: `Approved`
- Remaining notes: I1-1 (Closed — R2 field-level ACs を business-level 1本に統合)、I1-2 (Closed — テストルーティング漏れを除去)、I1-3 (Closed — Out of Scope から実装詳細参照を除去)。全 Critical・Major finding が Closed。
