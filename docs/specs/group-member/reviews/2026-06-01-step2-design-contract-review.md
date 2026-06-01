# SDD Review Record — group-member / Step 2 Design + Contract (Reverse SDD)

## Scope

- Feature: `group-member`（add-member / remove-member 統合）
- Step: `Step 2 - Design + Contract (Reverse SDD)`
- Artifact(s):
  - `docs/specs/group-member/design.md` (新規作成)
  - `contracts/paths/groups-groupId-members.yaml` (既存 — add-member Step 2 で quality-bar 準拠済み)
  - `contracts/paths/groups-groupId-members-userUuid.yaml` (更新 — per-response tables + grouped examples 追加)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/group-member/requirements.md` | R1〜R9 全 AC |
| 実装 | `GroupServiceImpl.addMember` / `removeMember` | 2メソッド実装 |
| 既存 design.md | `add-member/design.md` | add-member の高品質 Step 2 baseline |
| Scenario Tests | `AddMemberTestcontainersTest` / `RemoveMemberScenarioTest` | R1〜R8 シナリオをカバー |
| Controller Web Test | `GroupControllerWebTest` | 全 status code + error_code アサート |

---

## Final Status

- Status: `Approved`
- Remaining notes: Critical・Major finding なし。`design.md` 新規作成・`groups-groupId-members-userUuid.yaml` quality-bar 準拠に更新で reverse SDD Step 2 baseline が確立。`groups-groupId-members.yaml` は add-member Step 2 で既に quality-bar 準拠済みのため変更不要。
