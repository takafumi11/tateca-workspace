# SDD Review Record — auth-user / Step 1 Requirements (Reverse SDD)

## Scope

- Feature: `auth-user`（旧: `create-auth-user` / `get-auth-user` / `delete-auth-user` / `update-review-preferences` を統合）
- Step: `Step 1 - Requirements (Reverse SDD)`
- Current repo: `tateca-workspace`
- Artifact(s): `docs/specs/auth-user/requirements.md`

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| 実装 | `AuthUserServiceImpl` | createAuthUser / getAuthUserInfo / deleteAuthUser / updateAppReview の全実装 |
| Controller | `AuthUserController` | POST /auth/users / GET /auth/users/{uid} / DELETE /auth/users/{uid} / PATCH /auth/users/review-preferences |
| Entity | `AuthUserEntity` | フィールド定義・@PrePersist・@PreUpdate |
| DTO | `CreateAuthUserRequestDTO` / `UpdateAppReviewRequestDTO` | バリデーションアノテーション |
| Scenario Tests | `CreateAuthUserScenarioTest` | R1-AC1〜AC3・R2・R3 を Testcontainers でカバー |
| Controller Web Test | `AuthUserControllerWebTest` | 全操作の 201/200/204/400/401/404/409/415 アサート |
| OpenAPI | `auth-users.yaml` / `auth-users-uid.yaml` / `auth-users-review-preferences.yaml` | エンドポイント・ステータスコード |
| 旧 requirements | `create-auth-user/requirements.md`（レビュー済み） | R1〜R3 |
| 旧 requirements | `get-auth-user/requirements.md`（レビューなし） | R1〜R3 |
| 旧 requirements | `delete-auth-user/requirements.md`（レビューなし） | R1〜R3 |
| 旧 requirements | `update-review-preferences/requirements.md`（レビューなし） | R1〜R3 |

---

## 統合判断

4フィーチャーを `auth-user` に統合した理由:
- 同一リソース（`AuthUserEntity`）・同一コントローラー（`AuthUserController`）への操作
- Domain Definitions（AuthUser・UID・AppReviewStatus）が4ファイルに重複していた
- create → get → update-review-preferences → delete という AuthUser ライフサイクルとして読める

---

## Gap Analysis（旧ファイルの quality bar 違反）

| ファイル | 違反項目 | 対処 |
|---------|---------|------|
| `get-auth-user` R2 | AC1（3条件箇条書き）+ AC2（128文字超過）— field-level ACs が Step 1 に混入 | 統合 R5 で business-level 1本に統合 |
| `get-auth-user` R2-AC1/AC2 | `WHEN ～` で始まり GIVEN がない — GIVEN/WHEN/THEN 形式不完全 | 統合 R5 で修正 |
| `get-auth-user` Out of Scope | "現在の実装では～" — 実装詳細混入 | 削除 |
| `delete-auth-user` R2 | AC1（3条件箇条書き）+ AC2（128文字超過）— field-level ACs が Step 1 に混入 | 統合 R5 で business-level 1本に統合 |
| `delete-auth-user` R2-AC1/AC2 | `WHEN ～` で始まり GIVEN がない — GIVEN/WHEN/THEN 形式不完全 | 統合 R5 で修正 |
| `delete-auth-user` `Processing Order` セクション | 実行順序の詳細（存在確認→紐付け解除→削除）は Step 2 設計情報 | 削除 |
| `delete-auth-user` Out of Scope | "現在の実装では～" — 実装詳細混入 | 削除 |
| `update-review-preferences` R2 | AC1（2条件箇条書き）+ AC2（enum 違反）— field-level ACs が Step 1 に混入 | 統合 R9 で business-level 1本に統合 |
| `update-review-preferences` R2-AC1/AC2 | `WHEN ～` で始まり GIVEN がない — GIVEN/WHEN/THEN 形式不完全 | 統合 R9 で修正 |
| `update-review-preferences` Out of Scope | "現在の実装では～" — 実装詳細混入 | 削除 |
| `create-auth-user` | Step 1 レビュー済み（I1-1/I1-2/I1-3 Closed）| 統合時に修正内容を維持 |
| Domain Definitions | 4ファイルに重複（AuthUser・UID） | 1箇所に集約 |

---

## Iteration 1

### Reviewer: Senior Product Manager (Business Requirements & ACs)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | `get-auth-user` R2 / `delete-auth-user` R2 / `update-review-preferences` R2 | field-level ACs（箇条書き条件・文字数制限・enum 制約）が Step 1 に混入。quality bar「business-level 1本・field-level は API Contract へ」違反 | Fix | Closed |
| I1-2 | Major | `get-auth-user` R2-AC1/AC2 / `delete-auth-user` R2-AC1/AC2 / `update-review-preferences` R2-AC1/AC2 | `WHEN ～` で始まる AC — GIVEN/WHEN/THEN 形式不完全 | Fix | Closed |
| I1-3 | Minor | `delete-auth-user` `Processing Order` | 実行順序（存在確認→紐付け解除→削除）は Step 2 設計情報。Step 1 からは削除し Step 2 `design.md` の Canonical Testable Flows に委ねる | Fix | Closed |
| I1-4 | Minor | 各 Out of Scope | "現在の実装では～" 実装詳細参照を削除し事実のみ残す | Fix | Closed |
| I1-5 | Minor | `get-auth-user` / `delete-auth-user` Domain Definitions | `UID` の定義が `get-auth-user` では "最大128文字" と定量制限を含む（field-level 詳細は API Contract へ） | Fix | Closed |
| I1-6 | Minor | `update-review-preferences` R8-AC3 | "3種類のいずれかのステータスで更新を要求する" — ステータスの任意遷移許容（逆遷移も可）は business-visible な境界。AC として残す | Accept | Closed |

### Reviewer: Senior QA (AC Completeness & Testability)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | R1〜R9 の全 AC が GIVEN/WHEN/THEN 形式でテスト可能。`CreateAuthUserScenarioTest` が R1〜R3 をカバー。`AuthUserControllerWebTest` が R4〜R9 の contract surface をカバー。R7 で取得・削除・レビュー更新の 3 つの不存在ケースをまとめたことで AC に抜けなし | — | — |

### Reviewer: Tech Lead (Technical Feasibility & Boundary)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | 4操作は同一 `AuthUserController` / `AuthUserServiceImpl` / `AuthUserEntity` に実装されており統合は自然。R5（取得・削除共通バリデーション）はパスパラメータの UID 検証（`@NotBlank` + `@Size(max=128)`）で共通化されており実装と一致。`Processing Order`（存在確認→紐付け解除→削除）は `AuthUserServiceImpl.deleteAuthUser` の実装順序と一致するが Step 2 設計情報のため `design.md` に移設する | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | R1〜R9 に重複 AC ID・プレースホルダーなし。Domain Definitions は1箇所に集約されており重複なし。R5 が R2（作成バリデーション）と共通化せず別立てにしているのは対象フィールド（UID vs email）が異なるため適切。R7 で3操作の不存在ケースをまとめているのは同一エラーコード（AUTH_USER.NOT_FOUND）に帰結するため適切 | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（コード → 通過テスト → OpenAPI → 既存ドキュメント）に従い監査した。`AuthUserServiceImpl` の全メソッドを直接確認して AC を導出した。兄弟スペックを証拠として借用していない。旧 `create-auth-user/requirements.md` の修正内容（I1-1/I1-2/I1-3）は統合版で維持されている | — | — |

---

## Iteration 1 Resolution

- I1-1: R2 / R5 / R9 をそれぞれ business-level 1本の AC に統合し、フィールド詳細は API Contract に委ねる旨の注釈を追加した
- I1-2: 全バリデーション AC を `GIVEN リクエスト入力が不正である WHEN ～ THEN システム SHALL 入力不備として拒否する` の GIVEN/WHEN/THEN 形式に統一した
- I1-3: `delete-auth-user` の `Processing Order` セクションを削除。実行順序は Step 2 `design.md` の Canonical Testable Flows に委ねる
- I1-4: 全 Out of Scope から "現在の実装では～" 接頭辞を削除した
- I1-5: Domain Definitions の `UID` から "最大 128 文字" の定量制限を削除。field-level 詳細は API Contract に委ねる

---

## Skill Checklist

### Common Quality Bar

- [x] プレースホルダー・未解決マーカー・重複 AC ID・HTTP 用語・実装用語・テストルーティング漏れが AC テキストに残っていない
- [x] 全 Requirement に GIVEN/WHEN/THEN 形式のテスト可能な AC があり、各 AC が1つの観測可能なアウトカムを記述している
- [x] ソース・実装・コントラクトのエビデンスはビジネス言語に変換されており、設計所有の詳細は Step 2 / Step 3 に handoff されている
- [x] サポートセクション（Scope / Out of Scope / Common Preconditions / Domain Definitions）は非自明な Step 1 価値を追加しており、セクション間および AC との重複がない
- [x] `Domain Definitions` はフィーチャー固有の用語のみ（AuthUser・UID・メールアドレス・アプリ内ユーザー・紐付け解除・AppReviewStatus・レビューダイアログ最終表示日時）
- [x] 内部インフラのエッジケース・運用チューニング値・フィールドレベルバリデーションルールが AC に昇格していない
- [x] ユーザーストーリーとセクションの説明が全 AC のアウトカムセットを網羅している

### Reverse Reconstruction Hygiene Pass

- [x] `requirements.md` は業務可視な現在の振る舞いのみを記述しており、意図した将来挙動を発明していない
- [x] エビデンスの参照順序（コード → 通過テスト → OpenAPI → 既存ドキュメント）に従っている
- [x] 旧4ファイルの quality bar 違反をすべて修正した上で統合している
- [x] 統合により失われた情報はなし（全 AC が統合版で維持されている）

---

## Final Status

- Status: `Approved`
- Remaining notes: I1-1〜I1-5 (Closed)。旧4ファイル（`create-auth-user` / `get-auth-user` / `delete-auth-user` / `update-review-preferences`）の `requirements.md` は `auth-user/requirements.md` に統合済み。旧ディレクトリは別途整理予定（Step 2 / Step 3 の統合と合わせて）。
