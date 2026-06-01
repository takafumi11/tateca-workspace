# SDD Review Record — group + group-member / Step 3 Black-Box Tests (Reverse SDD)

## Scope

- Feature: `group`（create / get-detail / get-list / update-name / join / leave）+ `group-member`（add-member / remove-member）
- Step: `Step 3 - Black-Box Tests (Reverse SDD)`
- Current repo: `tateca-backend`
- Artifact(s):
  - `src/test/java/com/tateca/tatecabackend/controller/GroupControllerWebTest.java` (更新 — LeaveGroupTests に `USER_NOT_IN_GROUP` / `USER_NOT_FOUND` の 404 ケース追加)

---

## Evidence Inventory

| エビデンス種別 | 参照先 | 主要な確認内容 |
|-------------|--------|--------------|
| Reverse Step 1 | `docs/specs/group/requirements.md` | R1〜R13 全 AC |
| Reverse Step 1 | `docs/specs/group-member/requirements.md` | R1〜R9 全 AC |
| Reverse Step 2 | `docs/specs/group/design.md` | QA E2E Matrix (GR-S01..GR-S11) / QA Contract E2E Matrix |
| Reverse Step 2 | `docs/specs/group-member/design.md` | QA E2E Matrix (GM-S01..GM-S08) / QA Contract E2E Matrix |
| 既存 Scenario Tests | `CreateGroupScenarioTest` | R1-AC1..4, R3-AC1..2, R4, R5-AC1 |
| 既存 Scenario Tests | `GetGroupDetailScenarioTest` | R5-AC1, R7-AC1 |
| 既存 Scenario Tests | `GetGroupListScenarioTest` | R8-AC1..3 |
| 既存 Scenario Tests | `UpdateGroupNameScenarioTest` | R9-AC1..4, R7-AC2 |
| 既存 Scenario Tests | `JoinGroupScenarioTest` | R10-AC1..2, R11-AC1..2, R12-AC1, R3-AC1..2, R7-AC5..7 |
| 既存 Scenario Tests | `LeaveGroupScenarioTest` | R13-AC1..3, R7-AC3..4 |
| 既存 Scenario Tests | `RemoveMemberScenarioTest` | GM R1-AC1..3, R2-AC1, R3-AC1..2, R4-AC1..3, R5-AC1..2 |
| 既存 Scenarios interface | `AddMemberScenariosTests` | GM R1-AC1..4, R3-AC1 |
| 既存 Testcontainers executor | `AddMemberTestcontainersTest` | GM-S01..GM-S05 (全 GREEN) |
| 既存 E2E executor | `AddMemberE2ETest` | staging プレースホルダー (5件 @Disabled) |
| 既存 Controller Web Test | `GroupControllerWebTest` | 全エンドポイントの status code + error_code アサート |
| QA Contract E2E Matrix (group) | `design.md` | `shouldReturn404WhenLeaveGroupUserNotInGroup` が未実装 → 追加 |
| QA Contract E2E Matrix (group) | `design.md` | `shouldReturn404WhenLeaveGroupNotFound` 既存確認済 |

---

## Iteration 1

- Reviewer: QA / Engineer / Sanity
- Verdict: `Needs Revision`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| I1-1 | Major | `GroupControllerWebTest$LeaveGroupTests` | QA Contract E2E Matrix の `shouldReturn404WhenLeaveGroupUserNotInGroup`（USER.NOT_IN_GROUP）が未実装。`design.md` で明示されている coverage gap。 | Fix | Closed |
| I1-2 | Minor | `GroupControllerWebTest$LeaveGroupTests` | `USER_NOT_FOUND`（Step3: delete userEntity not found）も leaveGroup フローの 404 として `design.md` Canonical Flow に存在するが未実装。 | Fix | Closed |

## Iteration 1 Resolution

- `GroupControllerWebTest.LeaveGroupTests` に以下2ケースを追加:
  - `shouldReturn404WhenUserNotInGroup` — `USER_NOT_IN_GROUP` 404 の exception → HTTP mapping を確認
  - `shouldReturn404WhenUserNotFound` — `USER_NOT_FOUND` 404 の exception → HTTP mapping を確認
- 追加後 `GroupControllerWebTest` 全6ケース GREEN (failures=0, errors=0) 確認済み

---

## Iteration 2 (Re-review)

- Reviewer: QA / Engineer / Sanity
- Verdict: `Approved`

| ID | Severity | Location | Comment | Triage | Status |
|----|----------|----------|---------|--------|--------|
| — | — | — | Critical / Major finding なし | — | — |

---

## Skill Checklist

- [x] The common Step 3 quality bar in `platform/skills/sdd-black-box-test/references/quality-bar.md` is satisfied
- [x] Reverse Step 1 and reverse Step 2 are sufficient to anchor owned Step 3 scope, `Verification entrypoint`, and QA matrices
- [x] Current Step 3 tests, owned OpenAPI, and relevant helpers were audited first
- [x] Reverse Step 3 assets reflect current behavior only
- [x] Reverse-created tests are GREEN or the RED cause is classified before code change
- [x] Review loop is complete: triage recorded, fixes applied for all required Critical and Major findings, re-review done, record saved in `docs/specs/{feature}/reviews/`

### Coverage Summary

| QA E2E Matrix row | 対応テスト | 状態 |
|---|---|---|
| GR-S01 (R1-AC1) | `CreateGroupScenarioTest` | ✅ GREEN |
| GR-S02 (R1-AC2,3,4) | `CreateGroupScenarioTest` | ✅ GREEN |
| GR-S03 (R5-AC1) | `GetGroupDetailScenarioTest` | ✅ GREEN |
| GR-S04 (R8-AC1,2,3) | `GetGroupListScenarioTest` | ✅ GREEN |
| GR-S05 (R9-AC1,2) | `UpdateGroupNameScenarioTest` | ✅ GREEN |
| GR-S06 (R9-AC3,4) | `UpdateGroupNameScenarioTest` | ✅ GREEN |
| GR-S07 (R10-AC1,2) | `JoinGroupScenarioTest` | ✅ GREEN |
| GR-S08 (R13-AC1,2) | `LeaveGroupScenarioTest` | ✅ GREEN |
| GR-S09 (R13-AC3) | `LeaveGroupScenarioTest` | ✅ GREEN |
| GR-S10 (R3-AC1) | `CreateGroupScenarioTest` / `JoinGroupScenarioTest` | ✅ GREEN |
| GR-S11 (R11-AC1,2) | `JoinGroupScenarioTest` | ✅ GREEN |
| GM-S01..GM-S05 | `AddMemberTestcontainersTest` | ✅ GREEN |
| GM-S06..GM-S08 | `RemoveMemberScenarioTest` | ✅ GREEN |

| QA Contract E2E Matrix row | 対応テスト | 状態 |
|---|---|---|
| shouldReturn400WhenCreateGroupInvalidInput | `GroupControllerWebTest$CreateGroupTests` | ✅ GREEN |
| shouldReturn415WhenCreateGroupNoContentType | `GroupControllerWebTest$CreateGroupTests` | ✅ GREEN |
| shouldReturn404WhenCreateGroupAuthUserNotFound | `CreateGroupScenarioTest` | ✅ GREEN |
| shouldReturn404WhenGetGroupNotFound | `GroupControllerWebTest$GetGroupInfoTests` | ✅ GREEN |
| shouldReturn400WhenGetGroupInvalidUuid | `GroupControllerWebTest$GetGroupInfoTests` | ✅ GREEN |
| shouldReturn400WhenUpdateGroupNameInvalidInput | `GroupControllerWebTest$UpdateGroupNameTests` | ✅ GREEN |
| shouldReturn404WhenUpdateGroupNameNotFound | `GroupControllerWebTest$UpdateGroupNameTests` | ✅ GREEN |
| shouldReturn403WhenJoinGroupInvalidToken | `GroupControllerWebTest$JoinGroupInvitedTests` | ✅ GREEN |
| shouldReturn404WhenJoinGroupNotFound | `GroupControllerWebTest$JoinGroupInvitedTests` | ✅ GREEN |
| shouldReturn409WhenJoinGroupAlreadyJoined | `GroupControllerWebTest$JoinGroupInvitedTests` | ✅ GREEN |
| shouldReturn409WhenJoinGroupMaxCount | `GroupControllerWebTest$CreateGroupTests` / `JoinGroupInvitedTests` | ✅ GREEN |
| shouldReturn404WhenLeaveGroupNotFound | `GroupControllerWebTest$LeaveGroupTests` | ✅ GREEN |
| shouldReturn404WhenLeaveGroupUserNotInGroup | `GroupControllerWebTest$LeaveGroupTests` | ✅ GREEN (今回追加) |
| shouldReturn400WhenMemberNameIsBlank | `GroupControllerWebTest$AddMemberTests` | ✅ GREEN |
| shouldReturn403WhenNotGroupMemberOnAdd | `GroupControllerWebTest$AddMemberTests` | ✅ GREEN |
| shouldReturn404WhenGroupNotFoundOnAdd | `GroupControllerWebTest$AddMemberTests` | ✅ GREEN |
| shouldReturn415WhenNoContentTypeOnAdd | `GroupControllerWebTest$AddMemberTests` | ✅ GREEN |
| shouldReturn403WhenNotGroupMemberOnRemove | `GroupControllerWebTest$RemoveMemberTests` | ✅ GREEN |
| shouldReturn404WhenGroupNotFoundOnRemove | `GroupControllerWebTest$RemoveMemberTests` | ✅ GREEN |
| shouldReturn404WhenMemberNotFound | `GroupControllerWebTest$RemoveMemberTests` | ✅ GREEN |
| shouldReturn409WhenMemberHasTransactions | `GroupControllerWebTest$RemoveMemberTests` | ✅ GREEN |

---

## Final Status

- Status: `Approved`
- Remaining notes: Critical・Major finding なし。`GroupControllerWebTest.LeaveGroupTests` に `USER_NOT_IN_GROUP` / `USER_NOT_FOUND` の 404 ケースを追加し、QA Contract E2E Matrix を完全にカバー。全シナリオ・Controller Web テスト GREEN 確認済み。`AddMemberE2ETest` は staging 向けに `@Disabled` のままで意図通り。
