# 機能単位 → ドメイン単位 AC 対応表

Go 移行の P1-0a（`plans/go-migration.md`）の作業ファイル。下の `missing` 10件と矛盾1件の扱いが決まり、業務上の上限を AC に戻したら削除する。

- 対象コミット: `f949138`（`docs/specs/*/requirements.md`）
- AC ID: `<名前> R<要件番号>-AC<Acceptance Criteria 内の番号>`
- 判定: `same` 同じ振る舞い（表現差は可） / `changed` 同じ状況を扱うが期待結果・上限・条件が異なる / `missing` 対応するドメイン単位 AC なし

## サマリ

| ドメイン | 機能単位 AC 数 | same | changed | missing |
|---|---|---|---|---|
| auth-user | 23 | 23 | 0 | 0 |
| group | 55 | 48 | 0 | 7 |
| group-member | 20 | 18 | 0 | 2 |
| transaction | 88 | 87 | 0 | 1 |
| **合計** | **186** | **176** | **0** | **10** |

補足:
- 個別の入力バリデーション AC 65 件（auth-user 6 / group 15 / transaction 44）は、ドメイン単位側の汎用 AC（「リクエスト入力が不正 → 入力不備として拒否」＋「フィールドレベルの詳細は API Contract (OpenAPI) で定義する」の注記）に対応づけて `same` としている。具体的な条件・上限値（例: UID 128 文字、グループ名 100 文字、タイトル 50 文字、参加者 9 名）はドメイン単位 requirements の本文にはない。OpenAPI 側にあるかは確認していない。
- 境界判定 1 件: remove-member R2-AC2 は `same` とした（下表のメモ参照）。

---

## auth-user

| 機能単位の AC ID | 判定 | ドメイン単位の AC ID | メモ |
|---|---|---|---|
| create-auth-user R1-AC1 | same | auth-user R1-AC1 | 同文 |
| create-auth-user R1-AC2 | same | auth-user R1-AC2 | 同文 |
| create-auth-user R1-AC3 | same | auth-user R1-AC3 | 同文 |
| create-auth-user R2-AC1 | same | auth-user R2-AC1 | 同文（両方とも OpenAPI 委譲） |
| create-auth-user R3-AC1 | same | auth-user R3-AC1 | 同文 |
| get-auth-user R1-AC1 | same | auth-user R4-AC1 | 同文 |
| get-auth-user R1-AC2 | same | auth-user R4-AC2 | 同文 |
| get-auth-user R1-AC3 | same | auth-user R4-AC3 | 同文 |
| get-auth-user R2-AC1 | same | auth-user R5-AC1 | 汎用 AC に統合。「UID 未設定・空・空白のみ」は本文になし（OpenAPI 委譲） |
| get-auth-user R2-AC2 | same | auth-user R5-AC1 | 汎用 AC に統合。「UID 128 文字超」の上限値は本文になし |
| get-auth-user R3-AC1 | same | auth-user R7-AC1 | 同文 |
| delete-auth-user R1-AC1 | same | auth-user R6-AC1 | 同文 |
| delete-auth-user R1-AC2 | same | auth-user R6-AC2 | 同文 |
| delete-auth-user R1-AC3 | same | auth-user R6-AC3 | 同文 |
| delete-auth-user R2-AC1 | same | auth-user R5-AC1 | 汎用 AC に統合。「UID 未設定・空・空白のみ」は本文になし |
| delete-auth-user R2-AC2 | same | auth-user R5-AC1 | 汎用 AC に統合。「UID 128 文字超」の上限値は本文になし |
| delete-auth-user R3-AC1 | same | auth-user R7-AC2 | 同文 |
| update-review-preferences R1-AC1 | same | auth-user R8-AC1 | 同文 |
| update-review-preferences R1-AC2 | same | auth-user R8-AC2 | 同文 |
| update-review-preferences R1-AC3 | same | auth-user R8-AC3 | 同文 |
| update-review-preferences R2-AC1 | same | auth-user R9-AC1 | 汎用 AC に統合（ステータス未指定・未設定。注記の「必須項目」） |
| update-review-preferences R2-AC2 | same | auth-user R9-AC1 | 汎用 AC に統合（3 種類以外の値。注記の「許容値」） |
| update-review-preferences R3-AC1 | same | auth-user R7-AC3 | 同文 |

## group

| 機能単位の AC ID | 判定 | ドメイン単位の AC ID | メモ |
|---|---|---|---|
| create-group R1-AC1 | same | group R1-AC1 | GIVEN が「要求者が認証済み」から「要求者のアカウント情報が存在し」に変わった。機能単位側も Common Preconditions に「アカウント情報が存在する」があるので条件は同じ |
| create-group R1-AC2 | same | group R1-AC2 | 同文 |
| create-group R1-AC3 | same | group R1-AC3 | 同文 |
| create-group R1-AC4 | same | group R1-AC4 | 同文 |
| create-group R2-AC1 | same | group R2-AC1 | 汎用 AC に統合（グループ名の未指定・空） |
| create-group R2-AC2 | same | group R2-AC1 | 汎用 AC に統合。「グループ名 100 文字超」の上限値は本文になし |
| create-group R2-AC3 | same | group R2-AC1 | 汎用 AC に統合（作成者名の未指定・空） |
| create-group R2-AC4 | same | group R2-AC1 | 汎用 AC に統合。「作成者名 50 文字超」の上限値は本文になし |
| create-group R2-AC5 | same | group R2-AC1 | 汎用 AC に統合（参加者リスト未指定） |
| create-group R2-AC6 | same | group R2-AC1 | 汎用 AC に統合（参加者リストが空） |
| create-group R2-AC7 | same | group R2-AC1 | 汎用 AC に統合（参加者名が空） |
| create-group R2-AC8 | same | group R2-AC1 | 汎用 AC に統合。「参加者名 50 文字超」の上限値は本文になし |
| create-group R2-AC9 | same | group R2-AC1 | 汎用 AC に統合。「参加者 9 名超」の上限値は本文になし（注記に「参加者数制限」とだけある） |
| create-group R3-AC1 | same | group R3-AC1 | 作成・参加共通の AC に統合 |
| create-group R3-AC2 | same | group R3-AC2 | 作成・参加共通の AC に統合 |
| create-group R4-AC1 | missing | — | 「認証情報がない → 拒否」の AC がない。group は Common Preconditions で「要求者は認証済み」を暗黙の前提にしているだけ |
| create-group R4-AC2 | missing | — | 「認証情報が無効 → 拒否」の AC がない。理由は R4-AC1 と同じ |
| create-group R5-AC1 | same | group R4-AC1 | 同文 |
| get-group-detail R1-AC1 | same | group R5-AC1 | 同文 |
| get-group-detail R1-AC2 | same | group R5-AC2 | 同文 |
| get-group-detail R2-AC1 | same | group R6-AC1 | 汎用 AC に統合（注記に「識別子の形式」が明記されている） |
| get-group-detail R3-AC1 | same | group R7-AC1 | 同文 |
| get-group-list R1-AC1 | same | group R8-AC1 | 同文 |
| get-group-list R1-AC2 | same | group R8-AC2 | 同文 |
| get-group-list R1-AC3 | same | group R8-AC3 | 同文 |
| update-group-name R1-AC1 | same | group R9-AC1 | 同文 |
| update-group-name R1-AC2 | same | group R9-AC2 | 同文 |
| update-group-name R1-AC3 | same | group R9-AC3 | 同文 |
| update-group-name R1-AC4 | same | group R9-AC4 | 同文 |
| update-group-name R2-AC1 | same | group R6-AC1 | 汎用 AC に統合（グループ名の未指定・空） |
| update-group-name R2-AC2 | same | group R6-AC1 | 汎用 AC に統合。「100 文字超」の上限値は本文になし（注記に「グループ名の文字数制限」とだけある） |
| update-group-name R2-AC3 | same | group R6-AC1 | 汎用 AC に統合（グループ識別子の形式） |
| update-group-name R3-AC1 | same | group R7-AC2 | 同文 |
| join-group R1-AC1 | same | group R10-AC1 | GIVEN が「要求者が認証済み」から「要求者のアカウント情報が存在し」に変わった。機能単位側も Common Preconditions に「アカウント情報が存在する」があるので条件は同じ |
| join-group R1-AC2 | same | group R10-AC2 | 同文 |
| join-group R2-AC1 | same | group R11-AC1 | 同文 |
| join-group R2-AC2 | same | group R11-AC2 | 同文 |
| join-group R3-AC1 | same | group R3-AC1 | 作成・参加共通の AC に統合 |
| join-group R3-AC2 | same | group R3-AC2 | 作成・参加共通の AC に統合 |
| join-group R4-AC1 | same | group R12-AC1 | 同文 |
| join-group R5-AC1 | missing | — | 「メンバー識別子が未指定 → 入力不備」がない。group の入力バリデーション AC は R2-AC1（作成）と R6-AC1（詳細取得・名前更新・脱退）だけで、参加が含まれていない |
| join-group R5-AC2 | missing | — | 「招待トークンが未指定 → 入力不備」がない。理由は R5-AC1 と同じ。なお group R12-AC1 は「不正な招待トークン → 権限不足」で、未指定のケースでも入力不備でもない |
| join-group R5-AC3 | missing | — | 「メンバー識別子の形式が不正 → 入力不備」がない。理由は R5-AC1 と同じ |
| join-group R5-AC4 | missing | — | 「参加時のグループ識別子の形式が不正 → 入力不備」がない。理由は R5-AC1 と同じ |
| join-group R6-AC1 | same | group R7-AC5 | 同文 |
| join-group R6-AC2 | same | group R7-AC6 | 同文 |
| join-group R6-AC3 | same | group R7-AC7 | 同文 |
| leave-group R1-AC1 | same | group R13-AC1 | 同文 |
| leave-group R1-AC2 | same | group R13-AC2 | 同文 |
| leave-group R1-AC3 | same | group R13-AC3 | 同文 |
| leave-group R2-AC1 | same | group R6-AC1 | 汎用 AC に統合（グループ識別子の形式） |
| leave-group R2-AC2 | same | group R6-AC1 | 汎用 AC に統合（メンバー識別子の形式） |
| leave-group R3-AC1 | same | group R7-AC3 | 同文 |
| leave-group R3-AC2 | same | group R7-AC4 | 同文 |
| leave-group R3-AC3 | missing | —（最も近いのは group R7-AC4） | 「存在しないメンバーの脱退 → リソース不在」がない。group にあるのは R7-AC4「グループに所属していないメンバーの脱退」だけ。機能単位側では R3-AC2（所属していない）と R3-AC3（存在しない）が別の AC だった |

## group-member

| 機能単位の AC ID | 判定 | ドメイン単位の AC ID | メモ |
|---|---|---|---|
| add-member R1-AC1 | same | group-member R1-AC1 | 同文 |
| add-member R1-AC2 | same | group-member R1-AC2 | 同文 |
| add-member R1-AC3 | same | group-member R1-AC3 | 同文 |
| add-member R1-AC4 | same | group-member R1-AC4 | 同文 |
| add-member R2-AC1 | same | group-member R2-AC1 | 同文（両方とも OpenAPI 委譲） |
| add-member R3-AC1 | same | group-member R3-AC1 | 同文 |
| add-member R4-AC1 | same | group-member R4-AC1 | 追加・削除共通の AC に統合 |
| add-member R5-AC1 | same | group-member R5-AC1 | 同文 |
| remove-member R1-AC1 | same | group-member R6-AC1 | 同文 |
| remove-member R1-AC2 | same | group-member R6-AC2 | 同文 |
| remove-member R1-AC3 | same | group-member R6-AC3 | 同文 |
| remove-member R2-AC1 | same | group-member R7-AC1 | 同文 |
| remove-member R2-AC2 | same | group-member R7-AC1 | 境界判定。「要求者自身の削除 → 拒否」を明示する AC はない。機能単位側は「（参加済みであるため）」と書いて R2-AC1 の一ケースとして扱っている。要求者は定義上参加済みなので R7-AC1 に含まれると判断した |
| remove-member R3-AC1 | same | group-member R8-AC1 | 支払者と義務者を「支払者または義務者」として 1 つの AC に統合 |
| remove-member R3-AC2 | same | group-member R8-AC1 | 同上 |
| remove-member R4-AC1 | missing | — | 「認証情報がない → 拒否」の AC がない。group-member は Common Preconditions で「要求者は認証済み」を暗黙の前提にしているだけ |
| remove-member R4-AC2 | missing | — | 「認証情報が無効 → 拒否」の AC がない。理由は R4-AC1 と同じ |
| remove-member R4-AC3 | same | group-member R4-AC1 | 追加・削除共通の AC に統合 |
| remove-member R5-AC1 | same | group-member R5-AC3 | 同文 |
| remove-member R5-AC2 | same | group-member R5-AC2 | 同文 |

## transaction

| 機能単位の AC ID | 判定 | ドメイン単位の AC ID | メモ |
|---|---|---|---|
| create-transaction R1-AC1 | same | transaction R1-AC1 | 同文 |
| create-transaction R1-AC2 | same | transaction R1-AC2 | 機能単位の R1-AC2 と R1-AC3 を 1 つの AC に統合 |
| create-transaction R1-AC3 | same | transaction R1-AC2 | 同上 |
| create-transaction R2-AC1 | same | transaction R2-AC1 | 同文 |
| create-transaction R2-AC2 | same | transaction R2-AC2 | ドメイン側は受取人に加えて支払者・タイトル・金額・通貨情報・日付も確認対象にしている（上位集合） |
| create-transaction R3-AC1 | same | transaction R3-AC1 | 同文 |
| create-transaction R3-AC2 | same | transaction R3-AC2 | 同文 |
| create-transaction R3-AC3 | same | transaction R3-AC3 | 同文 |
| create-transaction R4-AC1 | same | transaction R4-AC1 | 汎用 AC に統合（グループ識別子の形式。注記の「UUID 形式」） |
| create-transaction R4-AC2 | same | transaction R4-AC1 | 汎用 AC に統合（取引種別の未指定） |
| create-transaction R4-AC3 | same | transaction R4-AC1 | 汎用 AC に統合（タイトルの未指定・空・空白のみ） |
| create-transaction R4-AC4 | same | transaction R4-AC1 | 汎用 AC に統合。「タイトル 50 文字超」の上限値は本文になし（注記に「タイトルの文字数上限」とだけある） |
| create-transaction R4-AC5 | same | transaction R4-AC1 | 汎用 AC に統合（金額の未指定） |
| create-transaction R4-AC6 | same | transaction R4-AC1 | 汎用 AC に統合。「金額 0 以下」は本文になし（注記に「金額の最小値」とだけある） |
| create-transaction R4-AC7 | same | transaction R4-AC1 | 汎用 AC に統合（通貨コードの未指定・空・空白のみ） |
| create-transaction R4-AC8 | same | transaction R4-AC1 | 汎用 AC に統合。「大文字 3 文字」は本文になし（注記に「通貨コードの形式」とだけある） |
| create-transaction R4-AC9 | same | transaction R4-AC1 | 汎用 AC に統合（日付の未指定・空・空白のみ） |
| create-transaction R4-AC10 | same | transaction R4-AC1 | 汎用 AC に統合。「タイムゾーン付き ISO 8601」は本文になし（注記に「日付形式」とだけある） |
| create-transaction R4-AC11 | same | transaction R4-AC1 | 汎用 AC に統合（支払者識別子の未指定） |
| create-transaction R5-AC1 | same | transaction R4-AC1 | 汎用 AC に統合（立替詳細の未指定） |
| create-transaction R5-AC2 | same | transaction R4-AC1 | 汎用 AC に統合（義務リストが空。注記の「義務リストの件数上下限」） |
| create-transaction R5-AC3 | same | transaction R4-AC1 | 汎用 AC に統合（義務 9 件超。上限 9 は Domain Definitions「1件以上9件以下」に残っている） |
| create-transaction R5-AC4 | same | transaction R4-AC1 | 汎用 AC に統合（義務の負担金額の未指定） |
| create-transaction R5-AC5 | same | transaction R4-AC1 | 汎用 AC に統合。「義務の負担金額 0 以下」は本文になし |
| create-transaction R5-AC6 | same | transaction R4-AC1 | 汎用 AC に統合（義務の対象者識別子の未指定） |
| create-transaction R5-AC7 | same | transaction R4-AC1 | 汎用 AC に統合（立替で返済詳細も指定された場合。注記に「排他性」が明記されている） |
| create-transaction R6-AC1 | same | transaction R4-AC1 | 汎用 AC に統合（返済詳細の未指定） |
| create-transaction R6-AC2 | same | transaction R4-AC1 | 汎用 AC に統合（受取人識別子の未指定） |
| create-transaction R6-AC3 | same | transaction R4-AC1 | 汎用 AC に統合（返済で立替詳細も指定された場合。注記に「排他性」が明記されている） |
| create-transaction R7-AC1 | same | transaction R5-AC1 | 同文 |
| create-transaction R7-AC2 | same | transaction R5-AC2 | 同文 |
| create-transaction R7-AC3 | same | transaction R5-AC3 | 同文 |
| create-transaction R7-AC4 | same | transaction R5-AC4 | 同文 |
| get-transaction-detail R1-AC1 | same | transaction R6-AC1 | 同文 |
| get-transaction-detail R2-AC1 | same | transaction R6-AC2 | 同文 |
| get-transaction-detail R3-AC1 | same | transaction R7-AC2 | 汎用 AC に統合（グループ識別子の形式。注記の「UUID 形式」） |
| get-transaction-detail R3-AC2 | same | transaction R7-AC2 | 汎用 AC に統合（取引識別子の形式。注記の「UUID 形式」） |
| get-transaction-detail R4-AC1 | same | transaction R7-AC1 | 同文 |
| update-transaction R1-AC1 | same | transaction R8-AC1 | 同文 |
| update-transaction R1-AC2 | same | transaction R8-AC2 | ドメイン側は確認対象に義務リストも加えている（上位集合） |
| update-transaction R1-AC3 | same | transaction R8-AC3 | 同文 |
| update-transaction R1-AC4 | same | transaction R8-AC4 | 同文 |
| update-transaction R2-AC1 | same | transaction R9-AC1 | 同文 |
| update-transaction R3-AC1 | same | transaction R10-AC1 | 同文 |
| update-transaction R3-AC2 | same | transaction R10-AC2 | 同文 |
| update-transaction R3-AC3 | same | transaction R10-AC3 | 同文 |
| update-transaction R4-AC1 | same | transaction R11-AC1 | 汎用 AC に統合（グループ識別子の形式） |
| update-transaction R4-AC2 | same | transaction R11-AC1 | 汎用 AC に統合（取引識別子の形式） |
| update-transaction R4-AC3 | same | transaction R11-AC1 | 汎用 AC に統合（タイトルの未指定・空・空白のみ） |
| update-transaction R4-AC4 | same | transaction R11-AC1 | 汎用 AC に統合。「タイトル 50 文字超」の上限値は本文になし |
| update-transaction R4-AC5 | same | transaction R11-AC1 | 汎用 AC に統合（金額の未指定） |
| update-transaction R4-AC6 | same | transaction R11-AC1 | 汎用 AC に統合。「金額 0 以下」は本文になし |
| update-transaction R4-AC7 | same | transaction R11-AC1 | 汎用 AC に統合（通貨コードの未指定・空・空白のみ） |
| update-transaction R4-AC8 | same | transaction R11-AC1 | 汎用 AC に統合。「大文字 3 文字」は本文になし |
| update-transaction R4-AC9 | same | transaction R11-AC1 | 汎用 AC に統合（日付の未指定・空・空白のみ） |
| update-transaction R4-AC10 | same | transaction R11-AC1 | 汎用 AC に統合。「タイムゾーン付き ISO 8601」は本文になし |
| update-transaction R4-AC11 | same | transaction R11-AC1 | 汎用 AC に統合（支払者識別子の未指定） |
| update-transaction R4-AC12 | same | transaction R11-AC1 | 汎用 AC に統合（立替詳細の未指定） |
| update-transaction R4-AC13 | same | transaction R11-AC1 | 汎用 AC に統合（義務リストが空） |
| update-transaction R4-AC14 | same | transaction R11-AC1 | 汎用 AC に統合（義務 9 件超。上限 9 は Domain Definitions に残っている） |
| update-transaction R4-AC15 | same | transaction R11-AC1 | 汎用 AC に統合（義務の負担金額の未指定） |
| update-transaction R4-AC16 | same | transaction R11-AC1 | 汎用 AC に統合。「義務の負担金額 0 以下」は本文になし |
| update-transaction R4-AC17 | same | transaction R11-AC1 | 汎用 AC に統合（義務の対象者識別子の未指定） |
| update-transaction R5-AC1 | same | transaction R12-AC1 | 同文 |
| update-transaction R5-AC2 | same | transaction R12-AC2 | 同文 |
| update-transaction R5-AC3 | same | transaction R12-AC3 | 同文 |
| delete-transaction R1-AC1 | same | transaction R13-AC1 | 同文 |
| delete-transaction R1-AC2 | same | transaction R13-AC2 | 同文 |
| delete-transaction R2-AC1 | same | transaction R15-AC1 | 汎用 AC に統合（グループ識別子の形式） |
| delete-transaction R2-AC2 | same | transaction R15-AC1 | 汎用 AC に統合（取引識別子の形式） |
| delete-transaction R3-AC1 | same | transaction R14-AC1 | 同文 |
| get-transaction-history R1-AC1 | same | transaction R16-AC1 | 同文 |
| get-transaction-history R1-AC2 | same | transaction R16-AC2 | 同文 |
| get-transaction-history R1-AC3 | same | transaction R16-AC3 | 同文（既定 5 件） |
| get-transaction-history R1-AC4 | same | transaction R16-AC4 | 同文 |
| get-transaction-history R1-AC5 | same | transaction R16-AC5 | 同文 |
| get-transaction-history R2-AC1 | same | transaction R17-AC1 | 汎用 AC に統合（グループ識別子の形式） |
| get-transaction-settlement R1-AC1 | same | transaction R18-AC1 | 同文 |
| get-transaction-settlement R1-AC2 | same | transaction R18-AC2 | 同文 |
| get-transaction-settlement R1-AC3 | same | transaction R18-AC3 | 同文 |
| get-transaction-settlement R1-AC4 | same | transaction R18-AC4 | 同文 |
| get-transaction-settlement R2-AC1 | same | transaction R19-AC1 | 同文 |
| get-transaction-settlement R2-AC2 | same | transaction R19-AC2 | 同文 |
| get-transaction-settlement R3-AC1 | same | transaction R20-AC1 | 同文 |
| get-transaction-settlement R3-AC2 | same | transaction R20-AC2 | 同文 |
| get-transaction-settlement R4-AC1 | missing | — | 「2 人のメンバー間に貸し借りがある → 精算 1 件を返す」の AC がない。transaction R20 は 3 人以上の循環ケース（R20-AC3）だけで、R18-AC1 は精算の件数を決めていない |
| get-transaction-settlement R4-AC2 | same | transaction R20-AC3 | 同文 |
| get-transaction-settlement R5-AC1 | same | transaction R21-AC1 | 汎用 AC に統合（グループ識別子の形式） |

---

## Out of Scope / Scope / Domain Definitions の矛盾

扱いが食い違う箇所が 1 件ある。それ以外に矛盾は見つからなかった。

| 機能単位側の記述 | ドメイン単位側の記述 | 差異 |
|---|---|---|
| create-transaction Out of Scope:「取引種別の不正な値の検証（立替・返済以外の値はリクエスト解析段階で拒否される）」 | transaction R4 の注記:「フィールドレベルの詳細（…取引種別の列挙値…）は API Contract (OpenAPI) で定義する」（R4-AC1「入力不備として拒否」の対象） | 機能単位側は要件のスコープ外とし、ドメイン単位側は R4-AC1 の入力バリデーション対象としている |

## 参考: ドメイン単位側に引き継がれていない AC 以外の記述（矛盾ではない）

- get-auth-user / delete-auth-user Domain Definitions: UID は最大 128 文字
- delete-auth-user Processing Order: 存在確認 → 紐付け解除 → 削除（ドメイン R6-AC2 の「削除前に」が順序の一部をカバー）。Out of Scope: 削除の取り消し、関連グループや取引データの削除・再計算
- update-review-preferences Out of Scope: レビュー依頼のタイミング制御（クライアント側の責務）
- create-group Out of Scope: 招待トークンの有効期限設定のカスタマイズ（固定値 1 日）、作成後のメンバー追加（add-member で対応）
- get-group-detail Domain Definitions: グループ情報の項目（識別子・名前・招待トークン・トークン有効期限・作成日時・更新日時）、メンバー一覧、取引件数。Out of Scope: 取引詳細の取得、キャッシュ
- get-group-list Out of Scope: キャッシュ
- update-group-name Domain Definitions: グループ名は 1 文字以上 100 文字以下。Out of Scope: 名前変更の通知、グループ名以外の属性の更新
- join-group Out of Scope:「指定メンバーが当該グループに所属していることの検証（メンバーの存在のみ確認）」、`tokenExpires` は参照されない、招待トークンの再発行、参加の取り消し。Processing Order: グループ存在 → 重複 → 参加上限 → トークン → 紐付け
- leave-group Out of Scope: 強制退会、メンバーレコードの物理削除、脱退の取り消し
- remove-member Introduction: 脱退後のメンバーも削除対象になる。Processing Order: 認証 → グループ存在 → 要求者のメンバー確認 → 対象の存在 → 未参加か → 取引関与 → 削除
- create-transaction Domain Definitions: 通貨コード（ISO 4217、大文字 3 文字）、金額（通貨の最小単位の整数）、為替レート、立替詳細・返済詳細。Out of Scope: 下書き、取り消し。Processing Order: バリデーション → 為替レート解決（代替レートの保存を含む）→ 支払者存在 → グループ存在 → 保存 → 義務者・受取人の存在と保存
- get-transaction-detail Out of Scope: キャッシュ、精算情報の同時取得
- update-transaction Out of Scope: 更新履歴の記録。Processing Order: バリデーション → 取引存在 → 種別確認 → 支払者存在 → 為替レート解決 → 既存義務の削除 → 新しい義務の保存 → 取引保存
- delete-transaction Out of Scope: 削除理由の記録、削除時の精算再計算。Processing Order: 義務の削除 → 取引本体の削除
- get-transaction-history Out of Scope: 存在しないグループを指定しても空の一覧を返す（ドメイン側は「グループ存在確認」をスコープ外とするのみ）、取引種別・日付範囲でのフィルタリング
- get-transaction-settlement Out of Scope: 存在しないグループやメンバー 0 人のグループでも空の精算一覧を返す、端数は四捨五入で固定、特定メンバー間だけの精算。Domain Definitions: 精算の最適化（債務者と債権者を金額順に組み合わせる）、精算金額。Processing Order（6 段階）
