# SDD Review Record — group-member / Step 1 Requirements (Reverse SDD)

## Scope

- Feature: `group-member`（旧: `add-member` / `remove-member` を統合）
- Step: `Step 1 - Requirements (Reverse SDD)`
- Current repo: `tateca-workspace`
- Artifact(s): `docs/specs/group-member/requirements.md`

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| 実装 | `GroupServiceImpl.addMember` / `GroupServiceImpl.removeMember` | 認証済みメンバーによる追加・削除ロジック |
| Controller | `GroupController` | POST /groups/{groupId}/members / DELETE /groups/{groupId}/members/{userUuid} |
| 旧 requirements | `add-member/requirements.md`（Step 1〜3 レビュー済み）| R1〜R5 — quality bar 準拠済み |
| 旧 requirements | `remove-member/requirements.md`（レビューなし）| R1〜R5 |

---

## 統合判断

2フィーチャーを `group-member` に統合した理由:
- 「グループの認証済みメンバーが別のメンバーに対して操作する」という共通の認可モデル（R4）
- `GroupController` 内で `/groups/{groupId}/members` パスに集約されている
- Domain Definitions（認証済みメンバー・未参加メンバー・グループサイズ上限・取引関与メンバー）が重複していた
- `group` との分離: add/remove は「メンバー構成を認証済みメンバーが管理する」という固有の責務を持ち、グループ自体の CRUD とは異なる

---

## Gap Analysis（旧ファイルの quality bar 違反）

| ファイル | 違反項目 | 対処 |
|---------|---------|------|
| `add-member` | Step 1 レビュー済み（quality bar 準拠）| 統合時に内容を維持 |
| `remove-member` R4 | 認証 AC（R4-AC1/AC2）— auth filter 担当。Common Preconditions で表現済み | 独立 Requirement から削除し Common Preconditions に吸収 |
| `remove-member` `Processing Order` | 実行順序（7ステップ）は Step 2 設計情報 | 削除 |
| `remove-member` R3 | 取引関与 AC を支払者・義務者の2本に分離していた → 1本に統合可能 | R8-AC1 に統合 |
| `remove-member` Domain Definitions | 認証済みメンバー・未参加メンバーが重複 | 1箇所に集約 |

---

## Iteration 1

### Reviewer: Senior Product Manager (Business Requirements & ACs)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Minor | `remove-member` R4 | 認証 AC（auth filter 担当）は Common Preconditions で表現済み。独立 Requirement 不要 | Fix | Closed |
| I1-2 | Minor | `remove-member` `Processing Order` | 実行順序は Step 2 設計情報 | Fix | Closed |
| I1-3 | Minor | `remove-member` R3 | 支払者・義務者を2本に分離していたが「取引の支払者または義務者」として1本に統合 | Fix | Closed |

### Reviewer: Senior QA (AC Completeness & Testability)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | R1〜R9 の全 AC が GIVEN/WHEN/THEN 形式でテスト可能。R4 で認可（追加・削除共通）、R5 でリソース不存在（追加・削除共通）をまとめたことで AC 抜けなし。既存 `add-member` の ScenarioTest・ControllerWebTest が R1〜R5 をカバー済み | — | — |

### Reviewer: Tech Lead (Technical Feasibility & Boundary)

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `GroupController` の `/groups/{groupId}/members` 系エンドポイントが2操作を実装。認可ロジック（要求者が認証済みメンバーであること）が add/remove 共通であり R4 として統一表現が適切 | — | — |

### Reviewer: Sanity

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | R1〜R9 に重複 AC ID・プレースホルダーなし。`group` の R3（グループ参加上限：10名超でなく add-member は10名でグループサイズ上限）と `group-member` の R3（グループサイズ上限：10名）で上限値が異なることを確認 — グループ参加上限（ユーザー当たり9グループ）とグループサイズ上限（グループ当たり10メンバー）は別の制約で正しく分離されている | — | — |

### Reviewer: Reverse Reconstruction

- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | `add-member/requirements.md` は Step 1〜3 レビュー済みの quality bar 準拠版を基にした。`remove-member` の違反項目のみ修正した | — | — |

---

## Iteration 1 Resolution

- I1-1: `remove-member` の認証 Requirement を削除。Common Preconditions に吸収
- I1-2: `Processing Order` セクションを削除。Step 2 `design.md` に委ねる
- I1-3: 支払者・義務者の2本 AC を「支払者または義務者」の1本に統合

---

## Skill Checklist

### Common Quality Bar

- [x] プレースホルダー・重複 AC ID・HTTP 用語・実装用語なし
- [x] 全 Requirement に GIVEN/WHEN/THEN 形式のテスト可能な AC がある
- [x] フィールドレベルバリデーションルールが AC に昇格していない（R2・R9 は business-level 1本 + API Contract 委任注釈）
- [x] Domain Definitions は feature 固有の用語のみ

### Reverse Reconstruction Hygiene Pass

- [x] `requirements.md` は業務可視な現在の振る舞いのみを記述
- [x] `add-member` の quality bar 準拠内容を維持
- [x] `remove-member` の違反項目を修正した上で統合

---

## Final Status

- Status: `Approved`
- Remaining notes: I1-1〜I1-3 (Closed)。旧2ファイルを `group-member/requirements.md` に統合済み。
