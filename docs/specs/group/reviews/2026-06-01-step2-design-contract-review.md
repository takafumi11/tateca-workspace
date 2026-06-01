# SDD Review Record — group / Step 2 Design + Contract (Reverse SDD)

## Scope

- Feature: `group`（create / get-detail / get-list / update-name / join / leave 統合）
- Step: `Step 2 - Design + Contract (Reverse SDD)`
- Artifact(s):
  - `docs/specs/group/design.md` (新規作成)
  - `contracts/paths/groups.yaml` (更新)
  - `contracts/paths/groups-groupId.yaml` (更新)
  - `contracts/paths/groups-list.yaml` (更新)
  - `contracts/paths/groups-groupId-users-userUuid.yaml` (更新)
  - `contracts/components/examples/errors/USER_NOT_IN_GROUP.yaml` (新規)
  - `contracts/components/examples/errors/USER_MAX_GROUP_COUNT_EXCEEDED.yaml` (新規)
  - `contracts/components/examples/errors/GROUP_ALREADY_JOINED.yaml` (新規)
  - `contracts/components/examples/errors/GROUP_INVALID_JOIN_TOKEN.yaml` (新規)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/group/requirements.md` | R1〜R13 全 AC |
| 実装 | `GroupServiceImpl` | 6メソッド全実装 |
| Entity | `GroupEntity` | @PrePersist（tokenExpires=now+1day / createdAt / updatedAt）/ @PreUpdate |
| 定数 | `BusinessConstants` | MAX_GROUP_PARTICIPANTS=9 / MAX_GROUP_SIZE=10 |
| Scenario Tests | 各 ScenarioTest | R1〜R13 シナリオをカバー |
| Controller Web Test | `GroupControllerWebTest` | 全 status code + error_code アサート |
| 旧 OpenAPI | 各 groups-*.yaml | per-response tables・examples なし |
| 参照パターン | `add-member/design.md` | design.md の高品質参照 |

---

## Final Status

- Status: `Approved`
- Remaining notes: Critical・Major finding なし。`design.md` 新規作成・4 OpenAPI ファイル quality-bar 準拠に更新・4 error example 新規作成で reverse SDD Step 2 baseline が確立。
