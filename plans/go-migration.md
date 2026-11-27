# Go 移行計画（tateca-backend）

作業中だけ置く計画ファイル。移行が終わったら P5-3 で削除する。
各 PR は、そのセクションのチェックボックスがすべて埋まったときに完了とする。

## 何が変わるか

tateca-backend の実装を Java / Spring Boot から Go に置き換える。API 契約、DB スキーマ、クライアントから見える振る舞いは変えない。

## 決定事項

| 項目 | 決定 |
|---|---|
| Go のコードの置き場 | tateca-backend。`go.mod` をリポジトリ直下に置いて Java と同居させ、P5 で Java だけを消す |
| 本番の切り替え方 | iOS のメンテナンス中に一度に切り替える。時間帯は JST 02:00〜04:00 |
| 戻せる期間 | 1週間。Java の Railway サービスは削除せず、停止した状態で残す |
| 正しさの基準 | 今の Java の振る舞い。バグも含む |
| 要件と AC | workspace の `product/requirements/{spec}.md` が正本。PdM が読み、変えるときは PdM が承認する。移行後も残して保守する |
| テストと AC の対応 | テストは AC の ID（`{spec} R{n}-AC{m}`、例: `group R1-AC2`）を持つ。テストを実行して確かめた AC の ID と、requirements.md の AC 一覧を、CI で両方向から比べる。この仕組みは移行後も残す |
| 確認の役割 | AC テストは API だけで確認する。データの互換性は「流し分け」で確認する（GIVEN を一方の実装、WHEN/THEN をもう一方の実装で、同じ DB に対して流す） |
| テストの網羅の分母 | AC の分母は requirements.md。AC になっていない振る舞いの分母は、black-box テストを流したときのコードカバレッジ（Java は JaCoCo、Go は `go build -cover`）。RSF（AWS の Reverse Spec Flow）は、実際に動かして測るほうが安く確実なので使わない |
| API の形とエラー | 手書きの OpenAPI（`contracts/`）は正ではない。移行中は凍結し、P5-3 で docs.tateca.net と一緒に片付ける。request と response の形は、Java の実際のレスポンスを記録したもので固定する。エンドポイントごとに返りうるエラーは、Go ではハンドラーの横にコードで宣言し、宣言外のエラーを返せない型にしたうえで、テストで観測したものと両方向で比べる。OpenAPI は、外部に渡す必要が出たときに、この宣言から生成する |
| Go のライブラリ（P2-0 で決めた） | ルーティングは chi、DB アクセスは sqlc（生成したコードは database/sql）、migration は golang-migrate。エラーの宣言の形は、ハンドラーが「本体か、そのエンドポイントで宣言したエラー」を返し、書き出しは共通の部品が1か所で行う形にする。理由: chi は存在しないパスと 405 の応答を差し替えられ、認証のいらないパスや `/internal/**` をまとめて1か所に置ける。sqlc は列の並びを手で合わせずに済み、UUID の型を1か所で差し替えられ、migration のコピーをそのままスキーマとして読める。golang-migrate は `force` で既存の DB を1コマンドで登録でき、Java の migration をバイト単位で同じままコピーできる（goose は先頭に注釈が要り、baseline のコマンドもない） |
| 移行のためだけのもの | 流し分けの設定、Java と Go を両方起動する compose、コピーしたファイルが同一かを確かめる CI の1ステップ（いずれも P5-1 で消す） |

## 移行中のルール（P1-1 の開始から P5-1 まで）

- 新しい migration を作らない。
- `messages*.properties`、`contracts/`、`product/requirements/*.md` の AC を変えない（P1-0a で AC を足すのは除く）。急ぎのバグ修正でエラーや AC を変える必要があるときだけ、PdM の承認を得てから変える。そのときは、requirements の PR を backend の PR の直前にマージし、AC 対応チェックが落ちる時間を短くする。
- backend に新機能を入れない。急ぎのバグ修正は Java に入れ、同じ PR で acceptance テストを足す。Go 側の対応は、該当する P2 の PR に含める。
- 移植中に見つけたバグは直さない。issue にして（ラベルは `go-migration-bug`）、テストは今の振る舞いのまま固定する。
- requirements.md の AC と Java の実際の振る舞いが食い違ったら、それもバグとして扱う。issue にし、テストは今の振る舞いを固定したうえで、AC の ID と issue 番号を付ける。AC の文面は変えない。移行が終わったら、テストを AC に合わせて直してから（RED）、コードを直す。

## PR の順番と依存関係

```
{P0, P1-0a} → P1-1 → {P1-2, P1-3, P1-4}
P1-1 → P2-0（PR なし）→ P2-1 → P2-2 → P2-3 → P2-4
                         P2-1 → P2-5
P1 と P2 のすべて → P3 → P4（人が go を出す）→ 1週間 → P5-1 → P5-3
```

| ID | リポジトリ | 内容 | 依存 | 並列 |
|---|---|---|---|---|
| P0 | tateca-backend | verify-tateca-api スキル | なし | P1-0a と並列可 |
| P1-0a | tateca-workspace | requirements の正本を揃える（大半は構成変更で済） | なし | P0 と並列可 |
| P1-1 | tateca-backend | acceptance テストの土台、カバレッジの測定、auth/user 群 | P0、P1-0a | — |
| P1-2 | tateca-backend | group/member 群 | P1-1 | P1-3、P1-4 と並列可 |
| P1-3 | tateca-backend | transaction 群と精算のケース集 | P1-1 | P1-2、P1-4 と並列可 |
| P1-4 | tateca-backend | exchange rate 群 | P1-1 | P1-2、P1-3 と並列可 |
| P2-0 | なし（試作） | ライブラリの選定 | P1-1 | — |
| P2-1 | tateca-backend | Go の土台 | P2-0 | — |
| P2-2 | tateca-backend | auth/user（Go） | P2-1 | — |
| P2-3 | tateca-backend | group/member（Go） | P2-2、P1-2 | — |
| P2-4 | tateca-backend | transaction（Go） | P2-3、P1-3 | — |
| P2-5 | tateca-backend | exchange rate（Go） | P2-1、P1-4 | P2-2〜P2-4 と並列可 |
| P3 | tateca-backend、tateca-ios | staging でのリハーサル | P1 と P2 のすべて | — |
| P4 | tateca-config、tateca-backend、AWS | 本番の切り替え | P3、人の go | — |
| P5-1 | tateca-backend | Java の削除 | P4 から1週間後 | — |
| P5-3 | tateca-workspace、tateca-backend | docs の整理 | P5-1 | — |

P2-2〜P2-4 を直列にするのは、テストの準備を API で行うためである。transaction のテストは、Go の group API が動いていないと準備できない。

---

## P0　verify-tateca-api スキル（完了。tateca-backend #328 でマージ済み）

- [x] 依存: なし（事前に pstack を導入し、`/pstack:setup-pstack` まで済ませておく）
- [x] 触るファイル: tateca-backend の `.gitignore`（`.claude/*` を ignore したうえで `.claude/skills/` だけを外す。追跡対象はスキルの12ファイル）、`.claude/skills/verify-tateca-api/**`
- [x] 変更: `/pstack:create-verification-skill` でスキルを生成した。中身は、docker compose の MySQL と dev プロファイルでの起動、状態確認、HTTP での操作、証拠の取得、後片付けの手順
- [x] 結果: どのエージェントでも、同じ手順で Java の API を起動して操作できる
- [x] 確認 unit: なし（スキルを追加するだけ）
- [x] 確認 live: ラン ID `20261122T113657Z-42632`。起動は15秒、状態確認は9項目すべて ok。`POST /auth/users` → `POST /groups` → `GET /groups/{groupId}` が 201 → 201 → 200 で、作成者がメンバーに含まれていた。後片付けの後も証拠が残っている
- [x] 確認 perf: なし
- 未検証の手順（P1 のテストで覆う）: グループ9個の上限、為替レートの代替と、レートのない通貨の 404、自分の表示名の変更が成功するケース、アカウント削除後のメンバーの紐付け解除、空の参加者リスト、為替レートがない日付
- [x] keep-alive の Lambda が `/actuator/health` で 401 になっていた件を直した（tateca-backend #329 でマージ済み）
- [x] #328 と #329 のマージ後の CD が、Railway への再デプロイで失敗していた件を直した。原因は `RAILWAY_TOKEN` の失効（開発者がトークンを作り直して登録した）。失敗したジョブを再実行して成功し、2026-11-22 に本番で確かめた: 認証なしの `/actuator/health` が 200 `{"status":"UP"}`、`/actuator/prometheus` が 401、`/groups/list` が 401。CD は Railway の CLI のイメージを `latest` で使っているので、バージョンの固定は P3 で Go の CD を作るときにあわせて行う
  - 原因: #309（2026-03-08、関係のない SDD の PR）で、actuator の依存関係と、認証フィルタの `PUBLIC_PATHS` の `/actuator/health` が一緒に消えた。#325 は `SecurityConfig` の `permitAll` だけを戻したので効かなかった。フィルタだけを直しても、actuator がないので 500 になる
  - 修正: 失敗するテスト → `PUBLIC_PATHS` に戻す → actuator の依存関係を元どおりに戻し、公開するのは `health` だけにする（metrics と prometheus は使う人がおらず、公開するとログインした利用者なら誰でも読めるため）
  - 確認: verify スキルで実物を起動し、認証なしの `/actuator/health` が 200 `{"status":"UP"}`、認証なしの `/actuator/prometheus` が 401 になった。backend のテストは全560件が通った
- 見つかったバグ: 存在しないパスへの要求が 404 ではなく 500（`SYSTEM.INTERNAL_ERROR`）になる。`GlobalExceptionHandler` が `NoResourceFoundException` を 500 に変換している。tateca-backend #327（`go-migration-bug`）にした。P2-1 では Java と同じ 500 を返し、移行が終わってから直す

## P1-0a　requirements の正本を揃える

- [ ] 依存: なし
- [ ] 触るファイル: tateca-workspace の `product/requirements/**`
- [x] 変更（ワークスペースの構成変更で実施済み）
  - 正本をドメイン単位の6つにした: `auth-user`、`group`、`group-member`、`transaction`、`user`、`exchange-rate`（取得と更新を統合）
  - 機能単位の18ディレクトリと、design.md・reviews を削除した（コミット `f949138` の時点の内容は git の履歴に残っている）
  - AC の ID を本文に書いて固定した（`- **R{n}-AC{m}** ...`、138件）
- [x] 対応表を作った（`plans/ac-mapping.md`。今は削除済み）。機能単位の AC 186件のうち、176件はドメイン単位に含まれ、10件は含まれていない。内容が変わっている AC は0件。やらないことの扱いの矛盾が1件
- [x] 含まれていない10件と矛盾1件を決着させた
  - 認証の拒否（create-group R4-AC1/2、remove-member R4-AC1/2）: すべての操作に共通なので、新しい `access.md` の R1 にまとめた。内部 API の API キーによる拒否（`access R2-AC1`）も、コードの振る舞いから足した（PdM が意図したものとして承認済み）。`user` の R3-AC1/2 は `access.md` に統合して欠番にした
  - 参加時の入力不備（join-group R5-AC1〜AC4）: `group R6-AC2` として足した
  - 存在しないメンバーの脱退（leave-group R3-AC3）: コードは「所属していない」と同じ判定で拒否しているので、`group R7-AC4` に「存在しないメンバーを含む」と書き足した。新しい AC は作っていない
  - 2人の間の精算（get-transaction-settlement R4-AC1）: `transaction R20-AC4` として足した
  - 不正な取引種別（矛盾）: ドメイン単位の扱い（入力不備として拒否する。`transaction R4-AC1`）に揃え、注記に明記した
- [x] 業務上の上限を AC に戻した（値はすべてコードで確認した）: `group R2-AC2〜AC5`、`group R6-AC3`、`group-member R2-AC2`、`user R2-AC3`、`transaction R4-AC2〜AC5`、`transaction R11-AC2〜AC5`。形式だけの規則（UUID、日付、通貨コードの形式、メールアドレスや UID の長さ）は実装（コード）に任せた
- [x] AC は合計156件になった。`plans/ac-mapping.md` は役目を終えたので削除した（内容は git の履歴に残っている）
- 見つかったバグ: 参加できるグループの上限は、コードでは9個（`group R3-AC1` と一致）だが、利用者向けのエラーメッセージ（`USER.MAX_GROUP_COUNT_EXCEEDED`）は「参加できるグループは10個までです」と言っている。`go-migration-bug` の issue にした（tateca-backend #326。移行中は直さない）
- [x] 注記の参照先を、凍結した OpenAPI から「実装（コード）」に変えた
- [x] 結果: AC の分母が1か所に決まり、業務上の上限も AC として確かめられる
- [ ] 確認 unit: なし
- [x] 確認 live: 対応表の「含まれていない」行と矛盾が、すべて決着している（決着の内容は PR に書く）。PdM の承認は PR のレビューで行う
- [ ] 確認 perf: なし

## P1-1　acceptance テストの土台と auth/user 群（完了。tateca-backend #337 でマージ済み）

- [x] 依存: P0、P1-0a
- [x] 触るファイル
  - 追加: `acceptance/**`（Go のテストパッケージと、AC 対応チェック）、`acceptance/coverage-exclusions.md`（テストで通さない分岐とその理由）、`acceptance/compose.yaml`、`acceptance/seed/*.sql`、`acceptance/wiremock/**`、`acceptance/testdata/responses/**`（Java の実際のレスポンスの記録）
  - 変更: `.github/workflows/ci.yml`
  - 削除: `src/test/java/com/tateca/tatecabackend/` 配下の次のファイル
    - `scenario/CreateAuthUserScenarioTest.java`、`GetAuthUserScenarioTest.java`、`DeleteAuthUserScenarioTest.java`、`UpdateReviewPreferencesScenarioTest.java`、`UpdateUserNameScenarioTest.java`
    - `scenario/testcontainers/AuthUserTestcontainersTest.java`、`UpdateUserNameTestcontainersTest.java`
    - `scenario/e2e/AuthUserE2ETest.java`、`UpdateUserNameE2ETest.java`
    - `scenarios/AuthUser*`、`scenarios/UpdateUserName*`
    - `controller/AuthUserControllerWebTest.java` と `controller/UserControllerWebTest.java` のうち、HTTP で再現できるケース
- [x] 変更
  - 接続先を環境変数で切り替える。WHEN/THEN の接続先は `BASE_URL`、GIVEN の接続先は `GIVEN_BASE_URL`（省略したときは `BASE_URL`）
  - 認証は `x-uid` ヘッダで通す（dev プロファイル）。認証の拒否（`access` の AC）は、すべての操作に対して表形式のテストで確かめる
  - 準備は API で行う。通貨と為替だけは SQL シードで投入する。外部の為替 API は WireMock で代用する
  - Java の実際のレスポンスを記録して基準にする（`acceptance/testdata/responses/`）。テストはレスポンス全体を、記録したものと比べる。時刻、request_id、生成された UUID は、比べる前に正規化する。手書きの `contracts/` は Java とずれているので、検証には使わない
  - テストを実行したときに観測した「エンドポイントとエラーコードの組」を記録し、一覧として出力する。これが今の Java で返りうるエラーの一覧であり、Go での最初の宣言になる
  - テスト名には、requirements.md の AC の ID を付ける（例: `auth-user R1-AC2 ...`）。1つのテストが複数の AC を確かめてもよい
  - AC 対応チェックを作る。テストを実行したときに確かめた AC の ID を記録し、requirements.md の AC 一覧と両方向で比べる。「テストのない AC がある」「存在しない AC を指すテストがある」のどちらでも CI を落とす。requirements.md は workspace にあるので、CI で tateca-workspace も checkout する。この仕組みは移行後も残す
  - 確認は API だけで行い、DB は直接読まない
  - モックを使わないと起こせないケース（500 など）は移さずに Java に残し、P5-1 で消す
  - CI では、compose で MySQL、WireMock、Java（dev プロファイル）を起動してから、テストを流す
  - カバレッジを測る仕組みを作る。Java のサーバーを JaCoCo のエージェント付きで起動し、テストを流した後に、通っていない分岐の一覧を出す。対象は controller、service、入力チェック、エラーの変換、認証のフィルタ。通っていない分岐は、テストを足して固定するか、クライアントから観測できない理由を `acceptance/coverage-exclusions.md` に書く。この仕組みは移行後も、Go のカバレッジとして残す
- [x] 結果: auth/user の AC が Go のテストに移り、Java 側の該当テストが消える。AC 対応チェックが CI で動く
- [x] 確認 unit: CI で、このテストが Java に対して GREEN になる（テスト499件がすべて pass）
- [x] 確認 live
  - AC 対応チェックで、`auth-user`、`user`、`access` の AC がすべてテストで覆われている（出力を PR に貼る）。AC を1件わざと消すと、チェックが落ちる
  - カバレッジのレポートで、対象範囲の分岐がすべてテストで通っているか、通らない理由が書かれている（レポートを PR に貼る）。通っていなかった分岐には、特性テストを足してある
  - 削除した Java テストが確かめていたことが、新しいテストのどれかで確かめられている（対応表を PR に貼る）
  - Java を1か所わざと壊すと、該当するテストが落ちる（出力を PR に貼る。壊した変更はコミットしない）
  - 観測したエラーコードの一覧を、`contracts/` に書かれたエラーと突き合わせ、ずれを PR に貼る（今どれだけずれているかの記録。`contracts/` は直さない）
- [x] 確認 perf: なし
- [x] 結果の記録: AC 対応チェックは PASS（access 3/3、auth-user 19/19、user 10/10）。カバレッジは対象範囲で ok。AC を消す、テストを消す、Java のログイン回数を2ずつ増やす、のどれでもチェックが落ちた（最後のものではテストが9件落ちた）。`contracts/` とのずれは、観測したが宣言にないものが12件、宣言にあるが観測していないものが4件（モックがないと起こせない 500 で、Java のテストに残した）
- [x] 見つけたバグは issue にした（tateca-backend #333〜#336。#327 にも追記）。テストは今の振る舞いのまま固定してある
- [x] CI の初回で、Gradle がタスクの出力先にある未知のファイルを消すため、テストの結果の置き場所が消えた。置き場所を `build/acceptance/{stage,jacoco,out}` に分けて直した

## P1-2　group/member 群（完了。tateca-backend #349 でマージ済み）

- [x] 依存: P1-1
- [x] 触るファイル
  - 追加: `acceptance/group_test.go`、`acceptance/group_member_test.go`、`acceptance/testdata/responses/{group,group-member}/**`
  - 変更: `acceptance/internal/acc/`（`group_list` の配列を順不同で比べる、`S.GivenAny`）、`acceptance/fixtures_test.go`、`acceptance/compose.yaml`（`UNLIMITED_GROUP_UID`）、`acceptance/run`、`acceptance/coverage-exclusions.md`、`acceptance/testdata/observed-errors.txt`、`src/test/java/com/tateca/tatecabackend/AbstractIntegrationTest.java`
  - 削除: 計画にあった Java のテストすべてと、`controller/GroupControllerWebTest.java` の全体（モックがないと起こせないケースがなかった）、`rest/`（最後の利用者が AddMember だった）
- [x] 変更: P1-1 と同じやり方で移した。特権ユーザーのケースも含めた。`AbstractIntegrationTest` で、Java の結合テストを毎回空のテーブルから始めるようにした（group のテストを消すと、残ったデータで18件が毎回落ちたため）
- [x] 結果: group/member の AC が Go のテストに移った。`group`、`group-member` を `REQUIRED_AC_DOMAINS` に足し、`GroupController`、`GroupServiceImpl`、group の request DTO 4つをカバレッジの対象に足した
- [x] 確認 unit: Java に対して GREEN（`./gradlew test --rerun` は 341件がすべて pass）
- [x] 確認 live: 新しいスタックでの `acceptance/run` で、AC 対応チェックは PASS（access 3/3、auth-user 22/22、exchange-rate 14/14、group 42/42、group-member 17/17、user 12/12）。カバレッジは対象範囲で ok（通らない6行には理由を書いた）。Java をわざと壊す（グループ数の上限の比較を `>=` から `>` にする）と、group R3-AC1 が落ちる。`contracts/` とのずれは、観測したが宣言にないものが12件、宣言にあるが観測していないものが11件
- [x] 確認 perf: なし
- [x] AC のない振る舞いは、PdM が仕分けた。バグは issue にした（#344: 名前の前後の空白を除かない。#330 に追記: 誰でもグループを読め、メンバーのメールアドレスも見える）。意図したもの（UTF-16 で数える、同じ名前を許す、取引を消したメンバーは削除できる、参加者がいなくなってもグループは残り参加できる）は、`sdd-requirements` で AC にする。auth-user R1-AC3 の1秒のずれも #345 にした
- [x] 注意: `security/GroupAccessGuard.java` は、取引のエンドポイントからしか通らない分岐があるので、P1-3 でカバレッジの対象に足す

## P1-3　transaction 群と精算のケース集（完了。tateca-backend #350 でマージ済み）

- [x] 依存: P1-1
- [x] 触るファイル
  - 追加: `acceptance/transaction_test.go`、`acceptance/settlement_cases_test.go`、`acceptance/cmd/settlecases/`（ケースの生成器）、`acceptance/internal/settle/`、`acceptance/testdata/settlement/*.json`、`acceptance/testdata/responses/transaction/**`
  - 変更: `acceptance/internal/acc/`（クエリ文字列、記録に残さない `s.Probe`、`acc.Updating`、`obligations` の配列を順不同で比べる）、`acceptance/compose.yaml`（`WEB_VIEWER_UID`）、`acceptance/seed/reference-data.sql`（端数の出るレートと GBP）、`acceptance/exchange_rate_test.go`（R19-AC3 の手順）、`acceptance/run`、`acceptance/coverage-exclusions.md`、`acceptance/testdata/observed-errors.txt`
  - 削除: 計画にあった Java のテストすべてと、`controller/TransactionControllerWebTest.java` の全体（モックで作っていた2件は、サーバーが実際には返さない応答だった）
- [x] 変更: P1-1 と同じやり方で移した。transaction R19-AC3（後でレートが変わる）は、今日のレートを書き換えてよいのが為替の更新の流れのテストだけなので、その中の手順にした。精算のケース集は、固定シードで300件（円だけ、全通貨、端数の出る少額、各100件）を作り、Java の結果を記録した。Java は残高が同じメンバーの順番をランダムな UUID のハッシュで決めるので、生成器は同点の起きるケースを捨てる（`go run ./cmd/settlecases -check` で、生成器の計算が記録した300件と一致することを確かめられる）
- [x] 結果: transaction の AC が Go のテストに移り、精算の結果が Java の出力に固定された。`transaction` を `REQUIRED_AC_DOMAINS` に足し、`TransactionController`、`TransactionServiceImpl`、request DTO 2つ、`TransactionDetailsValidator`、`GroupAccessGuard` をカバレッジの対象に足した
- [x] 確認 unit: Java に対して GREEN（P1-2 の後に rebase して、`./gradlew test --rerun` は 248件がすべて pass）
- [x] 確認 live: 新しいスタックでの `acceptance/run` で、AC 対応チェックは PASS（transaction 68/68。ほかのドメインもすべて）。カバレッジは対象範囲で ok（通らない16行には理由を書いた。精算で端数を最大の債務者に寄せる処理は、残高の合計が必ず0なので動かない）。送金の丸めを `HALF_EVEN` にすると6件、`HALF_DOWN` にすると8件のケースと、R20-AC2 が落ちる。`contracts/` とのずれは、観測したが宣言にないものが17件、宣言にあるが観測していないものが7件。コードを書いていないエージェントの確認は PASS+NOTES
- [x] 確認 perf: なし
- [x] AC のない振る舞いは、ユーザーが仕分けた。バグは issue にして、今の振る舞いを固定した（#343: 暦にない日時が 500、2月29日・30日が28日になる。#346: 小数の金額を切り捨てて保存する。#347: 負の count で 500）。#348（レートのない日に同時に作ると片方が 409）は、結果がタイミングで変わるのでテストで固定していない。文字列の金額、無効な通貨、count=0 は付随として固定した
- [x] 注意: 記録は新しいスタックで取る。レートのない日の取引は、最初の1件がその日のレートを保存するので、使い回したスタックでは起きないことがある（#348 はこれで見つかった）

## P1-4　exchange rate 群（完了。tateca-backend #342 でマージ済み）

- [x] 依存: P1-1
- [x] 触るファイル
  - 追加: `acceptance/exchange_rate_test.go`、`acceptance/internal/acc/rates.go`（WireMock を操作する `acc.ExternalRates`）、`acceptance/testdata/responses/exchange-rate/**`
  - 変更: `acceptance/internal/acc/`（順番に流す `s.Step`、skip したテストの記録を残す、`exchange_rate` の配列を順不同で比べる）、`acceptance/compose.yaml`、`acceptance/run`、`acceptance/seed/reference-data.sql`、`acceptance/testdata/observed-errors.txt`。`acceptance/wiremock/**` は変えずに済んだ（WireMock は、テストから管理 API で操作する）
  - 削除: `scenario/GetExchangeRateScenarioTest.java`、`controller/InternalExchangeRateControllerWebTest.java`。`controller/ExchangeRateControllerWebTest.java` は、モックがないと起こせない 500 のケースだけを残した
- [x] 変更: `GET /exchange-rate/{date}` と、`X-API-Key` 付きの `POST /internal/exchange-rates` を移した。外部の為替 API が失敗したとき（試し直し、4xx、エラーの結果、壊れた JSON）に外から観測できる結果も、WireMock で再現して固定した
- [x] 結果: exchange rate の AC が移った。`exchange-rate` を `REQUIRED_AC_DOMAINS` に足し、為替の controller、service、`api/client/ExchangeRateApiClient` をカバレッジの対象に足した
- [x] 確認 unit: Java に対して GREEN（`./gradlew test --rerun` も pass）
- [x] 確認 live: 新しいスタックでの `acceptance/run` で、AC 対応チェックは PASS（access 3/3、auth-user 22/22、exchange-rate 14/14、user 12/12）。カバレッジは対象範囲で ok（通らない行は0）。同じスタックで2回目を流すと、更新の流れのテストだけが理由を表示して skip する。Java をわざと壊す（明日のレートを今日+2日に保存する）と、更新の流れのテストが落ちる
- [x] 確認 perf: なし
- [x] 見つけたバグは issue にした（#340: 0以下のレートを保存して上書きする。R8-AC1 と食い違う。#341: 外部サービスがエラーの結果を返すと 500 になり、試し直さない）。テストは今の振る舞いのまま固定してある
- [x] 注意: 更新の流れのテストが今日と明日のレートを書き換えるので、以後のテスト（P1-3）は固定の日付を使う。R3-AC1 の「有効かどうかにかかわらず」は、GET が無効な通貨を返さないため API では観測できず、GET で見える範囲を確かめている
---

## P2-0　試作（PR なし。完了）

- [x] 依存: P1-1
- [x] 変更: `GET /exchange-rate/{date}` を2通り作って比べた（arena。試作のコードは残していない）
  - A: 標準の net/http + database/sql の直書き + goose
  - B: chi + sqlc + golang-migrate
- [x] 判断基準と結果（判定役の採点と、自分で読んだ結果が一致した）
  - コードの読みやすさ: B。パッケージが分かれ、SQL と型が1対1。A はハンドラーの形が良い（取り込む）
  - エンドポイントのエラーを型で閉じる: 両者とも、コードごとの型を union の制約で縛る同じ形に行き着き、宣言外のコードでコンパイルが止まった。A の「ハンドラーは値を返し、応答を書けない」形のほうが抜け道が小さい
  - サービス層のエラーの変換漏れ: 両者とも go-check-sumtype で linter が落ちた（golangci-lint の `gochecksumtype`）。`default:` を書くと検出が消えるので、想定外は書き出しの部品で 500 にする
  - Java と同じエラー応答: どちらも記録と一致した。存在しないパスと 405 は、chi なら差し替えで合わせられる見込み。この差し替えと、壊れた JSON と 415 は、試作では動かしていない（P2-1 で確かめる）
  - `BINARY(16)` の UUID: どちらも、16バイトで書く小さな型が要る（google/uuid のままでは 36 文字の文字列で書いて失敗する）。sqlc では override で全モデルに一度に効く。NULL を許す列は override を分ける
  - 既存のスキーマの登録: golang-migrate は `force 2` で済んだ。goose は baseline がなく、自作のコマンドが要った。どちらでも、登録の前に `up` が流れると、V1 の `CREATE TABLE IF NOT EXISTS` が空の表を作り、V2 で落ちた
- [x] 結果: 「決定事項」に追記した
- [x] 確認 live: P1-4 の `TestExchangeRates` を、それぞれの Go のサーバーと Java に流した

  | 候補 | Go | Java |
  |---|---|---|
  | A | 全サブテスト PASS | 全サブテスト PASS |
  | B | 全サブテスト PASS（要求を記録する中継を挟み、テストの要求がすべて Go に届いたことを確かめた） | 全サブテスト PASS |

## P2-1　Go の土台（完了。tateca-backend #354 でマージ済み）

- [x] 依存: P2-0
- [x] 触るファイル
  - 追加: `go.mod`、`cmd/api/**`、`cmd/migrate/**`（登録の前の `up` を拒否する migration のコマンド）、`internal/**`（エンドポイントのエラーの宣言の表と、そこから生成するコードを含む）、`db/migrations/**`（V1 と V2 のコピー）、メッセージファイル（`messages*.properties` のコピー。`internal/` の下）、`cmd/api/Dockerfile`（直下の `Dockerfile.go` は、Go のソースとして読まれてビルドを壊すので置かない）
  - 変更: `acceptance/compose.yaml`（Go を追加）、`.github/workflows/ci.yml`（Go のビルドとテスト、コピーの同一性チェック）
- [x] 変更
  - 環境変数は Java と同じ名前を使う（`MYSQLHOST`、`MYSQLPORT`、`MYSQLDATABASE`、`MYSQLUSER`、`MYSQLPASSWORD`、`FIREBASE_SERVICE_ACCOUNT_KEY`、`FIREBASE_PROJECT_ID`、`LAMBDA_API_KEY`、`EXCHANGE_RATE_API_KEY`、`UNLIMITED_GROUP_UID`、`PORT`）
  - ヘルスチェックは Go 独自の `/health` にする。`/actuator/health` の互換は作らない
  - 認証
    - Firebase の ID トークンを、失効チェック付きで検証する（Java の `TatecaAuthenticationFilter.java:153` と同じ）。aud と iss も確認する
    - `/internal/**` は、API キーを定数時間で比較する
    - `x-uid` による迂回は、dev のときだけ有効にする
    - 認証を求めないパス（`/health`）は1か所だけで定義する。Java では2か所に分かれていて、片方だけ直したために `/actuator/health` が 401 になっていた
  - エラーの一覧（コード、HTTP ステータス、日英のメッセージ）を1か所に置く。メッセージはコピーした `messages*.properties` を読み、`Accept-Language` で切り替える（既定は日本語）。レスポンスの形は、P1 で記録した Java のエラーレスポンスに合わせる
  - 各エンドポイントのハンドラーの横に、返しうるエラーを宣言する仕組みを作る。宣言外のエラーコードは返せない型にする（返そうとするとコンパイルが通らない）。P2-0 で見つかった抜け道を塞ぐ
    - ハンドラーには `http.ResponseWriter` を渡さない。エラーの応答を書く関数は、router の部品（ハンドラーの戻り値の書き出し、panic の回収、存在しないパスと 405、壊れた JSON と 415）と認証の部品からだけ呼べるようにし、それ以外からの呼び出しを linter（forbidigo）で CI で落とす
    - エンドポイントのエラーの型と、それを作る関数は、ハンドラーとは別のパッケージに置き、フィールドを小文字にする。ハンドラーのパッケージから、構造体を直接作れないようにする
    - 宣言は1つの表（エンドポイント → エラーコードの一覧）から `go generate` で作る。union の制約と、実行時に読める一覧の両方を作り、エラーの対応チェックはこの一覧を読む。CI で `go generate` の後に差分がないことを確かめる
    - 認証のエラー（401）は、エンドポイントの宣言には書かず、経路の種類（認証あり、`/internal/**`、認証なし）から自動で足す。自動で足した 401 も、実行時に読める一覧に含める。エラーの対応チェックは、この一覧と、P1 で記録した一覧（`observed-errors.txt`）を比べる
  - サービス層のエラーは閉じた型にし、ハンドラーで漏れなく変換する。変換漏れは linter で CI を落とす
  - それでも変換されなかったエラーと panic は、すべて `SYSTEM.INTERNAL_ERROR`（500）として返す。そのときはエンドポイント名とエラーの種類をログに出し、アラートを上げる。500 はすべてのエンドポイントで宣言しておく。宣言外のエラーコードがクライアントに届くことはない
  - エラーの対応チェックを作る。テストで観測した「エンドポイントとエラーコードの組」と宣言を両方向で比べ、どちらかにしかない組があれば CI を落とす。この仕組みは移行後も残す
  - Go のサーバーをカバレッジを取れる形でビルドし（`go build -cover`）、テストを流したときのカバレッジを出す。P1 と同じく、通っていない分岐はテストを足すか、理由を書く
  - P2-2〜P2-5 では、各エンドポイントの宣言を P1 で記録した一覧から始め（バグも含めて引き継ぐ。P2-1 で、この一覧から表を作ってある）、エラーの対応チェックを GREEN にする
  - 壊れた JSON、415、存在しないパスに対して、Java と同じエラーを返す（存在しないパスが 500 になるのはバグで、#327 として移行後に直す）
  - 構造化ログと trace（W3C traceparent）
  - migration はコマンドとして用意するだけにして、サーバーの起動時には実行しない。`flyway_schema_history` があって golang-migrate の表が空のときは、`up` を拒否する。そのときは、Flyway の履歴で V1 と V2 の成功を確かめてから `force 2` を打つ登録だけを許す（P2-0 で、登録の前に `up` が流れると V2 で落ちることを確かめた）
  - CI では、`db/migrations` と Java の `src/main/resources/db/migration`、およびメッセージファイルが同じ内容かを diff で確かめる
- [x] 結果: 認証とエラー処理を備えた Go のサーバーが起動する（ハンドラはまだない）
- [x] 確認 unit: 認証の単体テスト（失効チェック、aud と iss、API キー、dev 以外では `x-uid` が効かないこと）
- [x] 確認 live: テストのうち認証まわりの AC（各機能の「未認証は拒否」など）が、Go に対して GREEN
- [x] 確認 perf: なし
- [x] 結果の記録: Go に向けた `acceptance/run`（`ACCEPTANCE_TARGET=go`）で、access の R1-AC1、R1-AC2、R2-AC1 が GREEN。Java の記録のうち、壊れた JSON、415、存在しないパス、違うメソッドの92件を Go に流し、応答の全体が一致した（`TestReplayJavaRecordings`）。わざと宣言外のエラーを返すとコンパイルが落ち、変換を漏らすと gochecksumtype が、禁止した書き出しを呼ぶと forbidigo が落ちた。Java が作った DB で、登録の前の `up` は拒否され、登録の後の `up` は変更なし。コードを書いていないエージェントの確認は PASS+NOTES
- [x] 先に入れたもの: 21のエンドポイントのエラーを、P1 の観測一覧から宣言した。sqlc は、最初のクエリを書く P2-2 で入れる
- [x] Go のファイルは、CD の `paths-ignore` に入れた（tateca-backend #353）。Go だけの PR では、本番は再デプロイしない

## P2-2　auth/user（Go。完了。tateca-backend #356 でマージ済み）

- [x] 依存: P2-1
- [x] 触るファイル: `internal/**`
- [x] 変更: auth/user の5つのエンドポイントを実装する。Java の `@Transactional` の範囲を、Go の明示的なトランザクションに対応させる
- [x] 変更（P2-1 から引き継いだもの）
  - sqlc を入れる。`BINARY(16)` の UUID は、16バイトで書く小さな型を override で当てる（P2-0）。DB のタイムゾーンを Java と合わせる
  - `acceptance/run` の `GO_TESTS` と `GO_AC_DOMAINS` を広げ、`GO_COVERAGE_ENFORCE` に `internal/httpapi/httpapi.go` と `internal/endpoint/` を足す。エラーの対応チェックが、Go で観測したエラーとも比べるようにする
  - Accept が合わないときの 406（auth-user の #327 の pin）、パスの UUID を body より先に読む順番、Jackson との JSON の違い（型の強制変換など）を、Java の記録に合わせる
- [x] 結果: auth/user が Go で動く
- [x] 確認 unit: ドメインロジックがあれば、その単体テスト
- [x] 確認 live: auth/user のテストが Go に対して GREEN。流し分けを両方向で実行して GREEN（GIVEN=Java・WHEN/THEN=Go、GIVEN=Go・WHEN/THEN=Java）。エラーの対応チェックが GREEN。Go のカバレッジで、通っていない分岐がない（理由を書いたものを除く）
- [x] 確認 perf: なし
- [x] 結果の記録: Go に向けた `acceptance/run` で 532件が pass（access 3/3、auth-user 22/22、user 12/12）。流し分けの両方向、Go が返したエラーと宣言の両方向の比較（`TestGoAnswersDeclaredErrors`）、カバレッジも ok。Java に対して pin テストを9件足した（既存の golden は書き換えていない）。新しいバグは #355（body で同じ項目を2回書くか、パスの UUID が空白だけだと 500）。Go にまだないエンドポイントへの呼び出しは、`GO_ENDPOINTS` で Java に送る。コードを書いていないエージェントの確認は PASS+NOTES
- [x] 注意: DB のエラーを 500 にする `store.Check` / `store.Must` は、`InTx` の中だけで使う

## P2-3　group/member（Go。完了。tateca-backend #357 でマージ済み）

- [x] 依存: P2-2、P1-2
- [x] 触るファイル: `internal/**`
- [x] 変更: group/member の8つのエンドポイントを実装する（`GroupController` に8つある）
- [x] 結果: group/member が Go で動く
- [x] 確認 unit: ドメインロジックの単体テスト
- [x] 確認 live: group/member のテストが Go に対して GREEN。流し分けを両方向で GREEN。エラーの対応チェックが GREEN。Go のカバレッジで、通っていない分岐がない（理由を書いたものを除く）
- [x] 確認 perf: なし
- [x] 結果の記録: Go に向けた `acceptance/run` で 905件が pass（group 42/42、group-member 17/17 を含む）。流し分けの両方向、エラーの対応チェック、カバレッジも ok。Java の参加（`POST /groups/{groupId}`）は本文を groupId より先に読むので、本文の検証をルーターが読むときに行う形にした（`endpoints.txt` の `json-first`）。#326、#330、#334、#344 は Java のとおりに残した。Java に対して pin テストを5件足した。新しいバグはなく、#355 に条件を書き足した。コードを書いていないエージェントの確認は PASS+NOTES

## P2-4　transaction（Go。完了。tateca-backend #360 でマージ済み）

- [x] 依存: P2-3、P1-3
- [x] 触るファイル: `internal/**`
- [x] 変更: transaction の6つのエンドポイントを実装する。精算の丸めは、Java の `BigDecimal` + `RoundingMode` と同じ結果になるようにする
- [x] 変更（P2-3 から引き継いだもの）
  - 参加の確認は `group.RequireMember` をそのまま使う
  - Java の `requireReader`（Web 閲覧用のサービスアカウント `WEB_VIEWER_UID` を通す）と `requireTransactionInGroup` を移す。取引の読み取り3つ（履歴、精算、1件）が `requireReader` を通る
  - 取引の本文にも `Check` を付け、Java の引数の順番を `endpoints.txt` に合わせる
  - sqlc が生成する、複数行を返すクエリの DB エラーの分岐は、クライアントから起こせない。カバレッジの除外に理由を書く（P2-3 と同じ扱い）
- [x] 結果: transaction が Go で動く
- [x] 確認 unit: 精算計算の単体テスト
- [x] 確認 live: transaction のテストが Go に対して GREEN。精算のケース集がすべて一致する。流し分けを両方向で GREEN。エラーの対応チェックが GREEN。Go のカバレッジで、通っていない分岐がない（理由を書いたものを除く）
- [x] 確認 perf: なし
- [x] 結果の記録: Go に向けた `acceptance/run` で 1617件が pass（transaction 68/68）。精算のケース集300件が一致した。流し分けの両方向、エラーの対応チェック、カバレッジも ok。精算は、1e-7 円を1とする整数（`math/big`）で計算する。Java の同点の並びは、UUID が決まれば一つに決まる。Go は Java の `HashMap` と `PriorityQueue` の動きを再現して、同じ並びにした（同点のある60グループで、精算が Java と完全に一致した）。新しいバグは #358（日付が TIMESTAMP の範囲外だと 409）と #359（負担者のリストに null があると 500）。コードを書いていないエージェントの確認は PASS+NOTES
- [x] Java と違う応答が3つ残っている。付随する振る舞いとして残すと、人が決めた（P3 の依存）

## P2-5　exchange rate（Go。完了。tateca-backend #361 でマージ済み）

- [x] 依存: P2-1、P1-4
- [x] 触るファイル: `internal/**`
- [x] 変更: `GET /exchange-rate/{date}` と `POST /internal/exchange-rates` を実装する。外部 API の retry（3回、1秒から倍々に待つ）と fallback も移す
- [x] 結果: exchange rate が Go で動く
- [x] 確認 unit: retry と fallback の単体テスト
- [x] 確認 live: exchange rate のテストが Go に対して GREEN。流し分けを両方向で GREEN。エラーの対応チェックが GREEN。Go のカバレッジで、通っていない分岐がない（理由を書いたものを除く）
- [x] 確認 perf: なし
- [x] 結果の記録: これで、すべてのエンドポイントが Go で動く。Go に向けた `acceptance/run` は、全部のテストをそのまま流す形になった（Go にないエンドポイントを Java に回す `GO_ENDPOINTS` は消した）。1687件が pass し、7つのドメインの AC がすべてそろった。新しいスタックでの為替の更新の流れ、流し分けの両方向、観測したエラーの一覧と使われていない記録の検査、カバレッジも ok。外部の為替 API の試し直し、#340、#341 は Java と同じ。Lambda と同じ要求を Java と Go に送ると、応答も外部 API への呼び出しの回数も同じだった。Java と違う振る舞いは、外部 API と実際のクライアントが起こさない形だけに残した（PR の Tradeoffs）。コードを書いていないエージェントの確認は PASS+NOTES
- [x] 後で考えること: 外部 API が応答を返さずに止まると、更新が終わらずに残る。Java も同じなので、移行による後退ではない。タイムアウトを足すのは P4 の後の候補。同時に2回更新したときの振る舞い（Java は 409）は、#348 と同じくテストしていない

---

## P3　staging でのリハーサル

- [ ] 依存: P1 と P2 のすべて
- [x] 依存（人の判断。2026-11-27 に決めた: 違いを付随する振る舞いとして残し、Go を Java に合わせない）: P2-4 の Go は、次の3つの要求で Java と違う応答を返す。どれも iOS は送らない（amount と count を整数から作る）。Web は読み取り専用で取引を作らず、count は 5 か 50 に固定。合わせる手間は小さい（tateca-backend #360 の確認による）
  - 空白だけの groupId と不正な count を一緒に送る: Java 400、Go 500
  - count が ASCII 以外の数字（全角の `１０` など）: Java 200、Go 400
  - 本文の amount が ASCII 以外の数字の文字列（全角の `"３００"` など）: Java は保存する、Go 400
- [ ] 触るファイル
  - tateca-backend: `.github/workflows/cd-go.yml`（新しく作る。Go のイメージを GHCR に push し、Railway の staging にデプロイする。Java の `cd.yml` は Go のパスを `paths-ignore` で無視していて、`paths-ignore` は workflow 全体に効くので、Go の CD は別の workflow にする。`cd-go.yml` は Go のパスと `cd-go.yml` 自身の変更で動く。Java の `cd.yml` の `paths-ignore` には `cd-go.yml` を足し、`cd.yml` のコメント（`Dockerfile.go`、「P4」）も今の形に直す）、`acceptance/**`（本物の Firebase ID トークンで認証できるようにする）
  - tateca-ios: `money-me-ios/src/Config/EnvConfig.swift`（開発ビルド用に STAGING を追加）
- [ ] 変更
  - Go の 500（変換されなかったエラーと panic）のログを、アラートにつなぐ（P2-1 ではログに出すところまで作った）
  - `tateca-mode` のマージの関門（Human gates）に `cd-go.yml` を足す。`cd-go.yml` ができると、Go のパスを変える PR のマージでデプロイが起きるため（tateca-backend #363 で `cd-go.yml` ができ、2026-11-27 に関門へ足した）
  - CD の Railway の CLI のイメージを、`latest` ではなく固定のバージョンにする（Java の CD も同じく）
  - P4 の手順を、メンテナンスの config を除いてそのまま staging で実行する。Java の停止、V2 までの登録、`staging-api.tateca.net` の付け替えまで含める
  - `api.tateca.net` を Railway のカスタムドメインで管理しているのか、DNS で管理しているのかを確かめ、P4 の手順に書き込む
- [ ] 結果: staging が Go に切り替わり、P4 の手順が確定する
- [ ] 確認 unit: なし
- [ ] 確認 live
  - 本物の Firebase トークンで、テストを staging の Go に流して GREEN
  - iOS の開発ビルド（STAGING）で、グループ作成 → 取引作成 → 精算表示 → 取引削除 が通る（画面を録画する）
  - Lambda と同じリクエスト（`X-API-Key` 付きの `POST /internal/exchange-rates`）を staging の Go に送ると成功し、`GET /exchange-rate/{date}` に新しいレートが返る
  - 手順全体が 60 分以内に終わる（各ステップの所要時間を記録する）
- [ ] 確認 perf
  - 先に、切り替え前の staging の Java で基準値を測る。対象は `GET /groups/{groupId}`、`GET /groups/{groupId}/transactions/settlement`、`POST /groups/{groupId}/transactions` の p50/p95 で、Java と Go を交互に複数回測る（`/pstack:benchmark-checklist`）
  - Go の p95 が、どれかのエンドポイントで Java の p95 を 10% 以上上回ったら失敗とする
  - 30 分間リクエストを止めた後の、最初のリクエストのレイテンシを記録する（keep-alive は削除した（tateca-infrastructure #9）ので、Railway のスリープからの立ち上がりが入る）
- [ ] 人の確認: 結果を見て、P4 に進むかどうかを人が判断する

## P4　本番の切り替え（人の go が必要）

- [ ] 依存: P3、人の go
- [ ] 触るファイル
  - tateca-config: `cloudflare-public/ios/v1/app-config.json`（`maintenance.enabled`。1.47.0 以降のアプリが読む）、`firebase-public/ios/maintenance_mode.json`（`is_maintenance`。1.47.0 より前のアプリが読む）。どちらも main に push すると自動でデプロイされる
  - tateca-backend: `.github/workflows/cd-go.yml`（本番用の Go サービスへのデプロイを足す）
- [ ] 前日まで: 本番用の Go サービスを、ドメインを付けずに Railway に用意しておく。DB のバックアップ手順を確かめる。メンテナンスのメッセージと終了予定時刻（04:00 JST）を用意する
- [ ] 手順
  1. 02:00 に、新旧両方の config でメンテナンスを ON にする。両方の URL を curl して ON になっていることを確かめる
  2. Java を止め、`api.tateca.net` の割り当てを外す
  3. DB のバックアップを取る
  4. Go の migration ツールに、V2 まで適用済みとして登録する（スキーマは変えない）。登録は `up` より必ず先に行う。migration のコマンドは、登録の前の `up` を拒否する（P2-1）
  5. Go を起動し、Railway がサービスごとに発行する URL に対して、テスト用アカウントで動作確認する。読み取り（`GET /auth/users/{uid}`、`GET /groups/list`、`GET /groups/{groupId}`、精算）と、書き込み1本（取引の作成 → 取得 → 削除）
  6. `api.tateca.net` を Go に付け、5 と同じ確認をする
  7. 新旧両方の config でメンテナンスを OFF にし、curl で確かめる
  8. 監視する。Better Stack のエラー率、09:01 JST の為替更新（`GET /exchange-rate/{当日}`）、iOS の実機での主要な流れ
- [ ] 戻し方 A（メンテナンス中に失敗した場合）: ドメインを Go から外して Java に付け、Java を起動してから、メンテナンスを OFF にする。この時点ではユーザーの書き込みがないので、データの心配はない
- [ ] 戻し方 B（メンテナンスを明けてから1週間以内）: メンテナンスを ON にしてから、A と同じ手順を踏み、メンテナンスを OFF にする。Go が書いたデータを Java が読めることは、流し分けで確認済み
- [ ] 結果: 本番が Go で動く
- [ ] 確認 live: 手順 5、6、8 がすべて通る
- [ ] 確認 perf: 切り替え前1週間の Java の p95（Better Stack）と比べる。切り替え後1日の Go の p95 が 10% 以上悪化していたら、原因を調べる

---

## P5-1　Java の削除（P4 から1週間後）

- [ ] 依存: P4 から1週間が経ち、戻していないこと
- [ ] 触るファイル
  - 削除: `src/`、`build.gradle.kts`、`settings.gradle.kts`、`gradle.properties`、`gradle/`、`gradlew`、`gradlew.bat`、`config/`、`Dockerfile`
  - Go の `cmd/api/Dockerfile` だけが残る
  - 変更: `.github/workflows/ci.yml`（Java のジョブとコピーの同一性チェックを削除）、`cd.yml`（Java の CD。削除する。Go は `cd-go.yml` でデプロイする）、`acceptance/**`（`GIVEN_BASE_URL` を削除）、`acceptance/compose.yaml`（Java を削除）、`AGENTS.md`、`CLAUDE.md`、`README.md`
  - Railway: 停止していた Java のサービスを削除する
- [ ] 結果: tateca-backend が Go だけになる
- [ ] 確認 unit: CI が Go だけで GREEN
- [ ] 確認 live: CD で staging にデプロイし、テストを staging に流して GREEN
- [ ] 確認 perf: なし

## P5-3　docs の整理

- [ ] 依存: P5-1
- [ ] 触るファイル
  - tateca-workspace: `AGENTS.md`（リポジトリの表の backend の説明を Go に合わせる）、このファイル（削除）。`product/requirements/` は残して保守する
  - tateca-workspace の API ドキュメント一式を削除する: `contracts/`、`openapi.yaml`、`redocly.yaml`、`scripts/`、`package.json`、`package-lock.json`、`CNAME`、`.github/workflows/`（API ドキュメントの CI/CD）
  - 人が行う: GitHub Pages を止め、docs.tateca.net の DNS レコードを消す
  - tateca-backend: `AGENTS.md`（技術スタック、コマンド、テストの慣習を Go に合わせ、存在しないパスへの参照を直す）
- [ ] 結果: 文書が Go の実態に合い、移行のためだけの文書がなくなる
- [ ] 確認 live: 文書が参照しているパスがすべて存在する
- [ ] 確認 perf: なし

---

## Go で静かにずれやすい点（レビューの観点）

| 点 | Java 側の実態 | どこで捕まえるか |
|---|---|---|
| 精算の丸め | `BigDecimal` + `RoundingMode`（`TransactionServiceImpl.java:36`） | P1-3 のケース集、P2-4 |
| JSON の型と必須項目 | BigDecimal の桁、timestamp の形式、null と欠落の違い | P1 で記録した Java の実際のレスポンスとの比較、P3 の iOS 実機での確認 |
| UUID のバイト順 | `BINARY(16)` と、`bin_to_uuid` で作られる列 | 流し分け（Java が書いたデータを Go が読む、その逆） |
| フレームワークが返すエラー | 壊れた JSON、415、バリデーションの field メッセージ（英語の文） | P1 のテスト、P2-1 |
| エンドポイントごとのエラーコード | 例外を `GlobalExceptionHandler` が一括で変換しており、どのエンドポイントが何を返すかはコードに書かれていない | P1 で観測した一覧、P2-1 のエラーの宣言と対応チェック |
| トークンの検証 | 失効チェック付き、aud と iss の確認（`TatecaAuthenticationFilter.java:153`） | P2-1 の単体テスト、P3 の本物のトークン |
| 多言語 | `Accept-Language`、既定は日本語 | テストで ja と en の両方を流す |
| 特権ユーザー | `UNLIMITED_GROUP_UID` にはグループの上限がない | P1-2 の既存 AC（CreateGroup Req3 AC2） |

## この計画に含めないもの

- 開発の流れの切り替え（SDD スキルの整理、`tateca-mode` の作成）。`plans/dev-flow.md` で扱う
- iOS で、フォアグラウンドに戻ったときにメンテナンスを再確認する改善（今後のメンテナンス全般に効く改善として、別のタスクにする）
- web のメンテナンス表示（メンテナンス中は web の読み取りがエラーになるが、これを許容する）
