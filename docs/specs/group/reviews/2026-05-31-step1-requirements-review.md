# SDD Review Record — group / Step 1 Requirements (Reverse SDD)

## Scope

- Feature: `group`（旧: `create-group` / `get-group-detail` / `get-group-list` / `update-group-name` / `join-group` / `leave-group` を統合）
- Step: `Step 1 - Requirements (Reverse SDD)`
- Current repo: `tateca-workspace`
- Artifact(s): `docs/specs/group/requirements.md`

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| 実装 | `GroupServiceImpl` | createGroup / getGroupInfo / getGroupList / updateGroupName / joinGroupInvited / leaveGroup |
| Controller | `GroupController` | POST /groups / GET /groups/{groupId} / GET /groups/list / PATCH /groups/{groupId} / POST /groups/{groupId} / DELETE /groups/{groupId}/users/{userUuid} |
| 旧 requirements | `create-group/requirements.md`（レビューなし） | R1〜R5 |
| 旧 requirements | `get-group-detail/requirements.md`（レビューなし） | R1〜R3 |
| 旧 requirements | `get-group-list/requirements.md`（レビューなし） | R1 |
| 旧 requirements | `update-group-name/requirements.md`（レビューなし） | R1〜R3 |
| 旧 requirements | `join-group/requirements.md`（レビューなし） | R1〜R6 |
| 旧 requirements | `leave-group/requirements.md`（レビューなし） | R1〜R3 |

---

## 統合判断

6フィーチャーを `group` に統合した理由:
- 全6操作が `GroupController` / `GroupServiceImpl` に集約
- グループ参加上限・特権ユーザー・招待トークン・認証済みメンバー/未参加メンバーの Domain Definitions が6ファイルに重複していた
- R3（グループ参加上限）が `create-group` と `join-group` で同一制約を共有していた

`add-member` / `remove-member` は `group-member` として別ファイルに分離した理由:
- 「グループの認証済みメンバーが別のメンバーに対して操作する」という固有の認可モデルを持つ
- `GroupController` 内でも `/groups/{groupId}/members` パスで分離されている

---

## Gap Analysis（旧ファイルの quality bar 違反）

| ファイル | 違反項目 | 対処 |
|---------|---------|------|
| `create-group` R2 | field-level ACs 9本（各条件を個別 AC として列挙）— Step 1 に混入 | 統合 R2 で business-level 1本に統合 |
| `create-group` R2 | `GIVEN` なし `WHEN ～` で始まる AC | 統合 R2 で修正 |
| `get-group-detail` R2 | `GIVEN` なし `WHEN ～` で始まる AC | 統合 R6 で修正 |
| `update-group-name` R2 | field-level ACs 3本 + `GIVEN` なし | 統合 R6 で business-level 1本に統合 |
| `update-group-name` Out of Scope | "現在の実装では～" 実装詳細混入 | 削除 |
| `join-group` R5 | field-level ACs 4本 + `GIVEN` なし | 統合 R6 で business-level 1本に統合（join-group はパスパラメータ形式バリデーションのため R7 のリソース不存在と整合） |
| `join-group` `Processing Order` | 実行順序（5ステップ）は Step 2 設計情報 | 削除 |
| `join-group` Out of Scope | "現在の実装では～" 実装詳細混入 | 削除 |
| `leave-group` R2 | `GIVEN` なし `WHEN ～` で始まる AC | 統合 R6 で修正 |
| `leave-group` Out of Scope | "現在の実装では～" 実装詳細混入 | 削除 |
| 全ファイル | Domain Definitions 重複（グループ参加上限・特権ユーザー・招待トークン等） | 1箇所に集約 |
| `create-group` R4 | 認証 AC（R4-AC1/AC2）— auth filter が担当するため common preconditions で足りる | 統合では Common Preconditions に吸収し独立 Requirement としない |

---

## Iteration 1

### Reviewer: Senior Product Manager (Business Requirements & ACs)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | 各旧ファイル R2 | field-level ACs（個別条件・文字数制限・形式制約）が Step 1 に混入。quality bar 違反 | Fix | Closed |
| I1-2 | Major | 各旧ファイル R2 | `GIVEN` なし `WHEN ～` で始まる AC — GIVEN/WHEN/THEN 形式不完全 | Fix | Closed |
| I1-3 | Minor | `join-group` `Processing Order` | 実行順序（グループ存在確認→重複チェック→…）は Step 2 設計情報 | Fix | Closed |
| I1-4 | Minor | 各 Out of Scope | "現在の実装では～" 実装詳細参照を削除 | Fix | Closed |
| I1-5 | Minor | `create-group` R4 | 認証 AC は Auth filter 担当。Common Preconditions「要求者は認証済みである」で表現済みのため独立 Requirement 不要 | Fix | Closed |

### Reviewer: Senior QA (AC Completeness & Testability)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | R1〜R13 の全 AC が GIVEN/WHEN/THEN 形式でテスト可能。グループ参加上限（R3）が作成と参加で共通の AC に統合されており重複排除。R7 でリソース不存在を6操作分まとめたことで AC 抜けなし | — | — |

### Reviewer: Tech Lead (Technical Feasibility & Boundary)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `GroupController` / `GroupServiceImpl` が6操作を実装しており統合は自然。R3（グループ参加上限）が create と join で同一ロジックを共有していることを AC レベルで統一表現。`Processing Order`（join の実行順序）は `GroupServiceImpl.joinGroupInvited` の実装順序と一致するが Step 2 設計情報のため `design.md` に委ねる | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | R1〜R13 に重複 AC ID・プレースホルダーなし。Domain Definitions は1箇所に集約。`group` と `group-member` の分離が `GroupController` のエンドポイント構造（`/groups/` vs `/groups/{id}/members`）と一致しており境界が自然 | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | エビデンス優先順位（コード → 通過テスト → OpenAPI → 既存ドキュメント）に従い監査した。`GroupController` / `GroupServiceImpl` を直接確認して AC を導出した。意図した将来挙動を発明していない | — | — |

---

## Iteration 1 Resolution

- I1-1: R2 / R6 を business-level 1本の AC に統合し、フィールド詳細は API Contract に委ねる旨の注釈を追加
- I1-2: 全バリデーション AC を GIVEN/WHEN/THEN 形式に統一
- I1-3: `join-group` の `Processing Order` セクションを削除。Step 2 `design.md` の Canonical Testable Flows に委ねる
- I1-4: 全 Out of Scope から "現在の実装では～" を削除
- I1-5: `create-group` の認証 Requirement を削除。Common Preconditions に吸収

---

## Skill Checklist

### Common Quality Bar

- [x] プレースホルダー・重複 AC ID・HTTP 用語・実装用語・テストルーティング漏れが AC テキストに残っていない
- [x] 全 Requirement に GIVEN/WHEN/THEN 形式のテスト可能な AC がある
- [x] ソース・実装・コントラクトのエビデンスはビジネス言語に変換されており、設計詳細は Step 2 に handoff
- [x] Domain Definitions は1箇所に集約され重複なし
- [x] フィールドレベルバリデーションルールが AC に昇格していない（R2・R6・R9 は business-level 1本 + API Contract 委任注釈）
- [x] ユーザーストーリーとセクションの説明が全 AC のアウトカムセットを網羅

### Reverse Reconstruction Hygiene Pass

- [x] `requirements.md` は業務可視な現在の振る舞いのみを記述
- [x] 旧6ファイルの quality bar 違反をすべて修正した上で統合
- [x] 統合により失われた AC はなし

---

## Final Status

- Status: `Approved`
- Remaining notes: I1-1〜I1-5 (Closed)。旧6ファイルを `group/requirements.md` に統合済み。
