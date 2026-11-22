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
| 確認の役割 | AC テストは API だけで確認する。データの互換性は「流し分け」で確認する（GIVEN を一方の実装、WHEN/THEN をもう一方の実装で、同じ DB に対して流す） |
| 移行のためだけのもの | 流し分けの設定、Java と Go を両方起動する compose、コピーしたファイルが同一かを確かめる CI の1ステップ。いずれも P5-1 で消す |

## 移行中のルール（P1-1 の開始から P5-1 まで）

- 新しい migration を作らない。
- `messages*.properties` と `contracts/` を変えない。
- backend に新機能を入れない。急ぎのバグ修正は Java に入れ、同じ PR で acceptance テストを足す。Go 側の対応は、該当する P2 の PR に含める。
- 移植中に見つけたバグは直さない。issue にして（ラベルは `go-migration-bug`）、テストは今の振る舞いのまま固定する。

## PR の順番と依存関係

```
P0 → P1-1 → {P1-2, P1-3, P1-4}
P1-1 → P2-0（PR なし）→ P2-1 → P2-2 → P2-3 → P2-4
                         P2-1 → P2-5
P1 と P2 のすべて → P3 → P4（人が go を出す）→ 1週間 → P5-1 → {P5-2, P5-3}
```

| ID | リポジトリ | 内容 | 依存 | 並列 |
|---|---|---|---|---|
| P0 | tateca-backend | verify-tateca-api スキル | なし | — |
| P1-1 | tateca-backend | acceptance テストの土台と auth/user 群 | P0 | — |
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
| P5-2 | tateca-infrastructure | keep-alive の整理 | P5-1 | P5-3 と並列可 |
| P5-3 | tateca-workspace、tateca-backend | docs の整理 | P5-1 | P5-2 と並列可 |

P2-2〜P2-4 を直列にするのは、テストの準備を API で行うためである。transaction のテストは、Go の group API が動いていないと準備できない。

---

## P0　verify-tateca-api スキル

- [ ] 依存: なし（事前に pstack を導入し、`/pstack:setup-pstack` まで済ませておく）
- [ ] 触るファイル: tateca-backend の `.gitignore`（`.claude/skills/` だけを ignore から外す）、`.claude/skills/verify-tateca-api/**`
- [ ] 変更: `/pstack:create-verification-skill` でスキルを生成する。中身は、docker compose の MySQL と dev プロファイルでの起動、状態確認、HTTP での操作、証拠の取得、後片付けの手順
- [ ] 結果: どのエージェントでも、同じ手順で Java の API を起動して操作できる
- [ ] 確認 unit: なし（スキルを追加するだけ）
- [ ] 確認 live: 生成時に一度通しで動かす。`POST /auth/users` → `POST /groups` → `GET /groups/{groupId}` で、作成者がメンバーに含まれていること。後片付けの後も証拠が残っていること
- [ ] 確認 perf: なし

## P1-1　acceptance テストの土台と auth/user 群

- [ ] 依存: P0
- [ ] 触るファイル
  - 追加: `acceptance/**`（Go のテストパッケージ）、`acceptance/compose.yaml`、`acceptance/seed/*.sql`、`acceptance/wiremock/**`、`api/openapi.bundled.yaml`
  - 変更: `.github/workflows/ci.yml`
  - 削除: `src/test/java/com/tateca/tatecabackend/` 配下の次のファイル
    - `scenario/CreateAuthUserScenarioTest.java`、`GetAuthUserScenarioTest.java`、`DeleteAuthUserScenarioTest.java`、`UpdateReviewPreferencesScenarioTest.java`、`UpdateUserNameScenarioTest.java`
    - `scenario/testcontainers/AuthUserTestcontainersTest.java`、`UpdateUserNameTestcontainersTest.java`
    - `scenario/e2e/AuthUserE2ETest.java`、`UpdateUserNameE2ETest.java`
    - `scenarios/AuthUser*`、`scenarios/UpdateUserName*`
    - `controller/AuthUserControllerWebTest.java` と `controller/UserControllerWebTest.java` のうち、HTTP で再現できるケース
- [ ] 変更
  - 接続先を環境変数で切り替える。WHEN/THEN の接続先は `BASE_URL`、GIVEN の接続先は `GIVEN_BASE_URL`（省略したときは `BASE_URL`）
  - 認証は `x-uid` ヘッダで通す（dev プロファイル）
  - 準備は API で行う。通貨と為替だけは SQL シードで投入する。外部の為替 API は WireMock で代用する
  - すべてのレスポンスを `api/openapi.bundled.yaml` で検証する。このファイルは workspace の `openapi.yaml` を `redocly bundle` で1ファイルにしたもので、契約の正は引き続き workspace の `contracts/` にある
  - テスト名には、Java の DisplayName をそのまま使う（例: `Req1/AC1: ...`）
  - 確認は API だけで行い、DB は直接読まない
  - モックを使わないと起こせないケース（500 など）は移さずに Java に残し、P5-1 で消す
  - CI では、compose で MySQL、WireMock、Java（dev プロファイル）を起動してから、テストを流す
- [ ] 結果: auth/user の AC が Go のテストに移り、Java 側の該当テストが消える
- [ ] 確認 unit: CI で、このテストが Java に対して GREEN になる
- [ ] 確認 live: 削除した Java テストの DisplayName 一覧と、新しいテスト名の一覧を突き合わせて差分がゼロであること（その出力を PR に貼る）。Java を1か所わざと壊すと、該当するテストが落ちること（出力を PR に貼る。壊した変更はコミットしない）
- [ ] 確認 perf: なし

## P1-2　group/member 群

- [ ] 依存: P1-1
- [ ] 触るファイル
  - 追加: `acceptance/**`
  - 削除: `scenario/CreateGroupScenarioTest.java`、`GetGroupListScenarioTest.java`、`GetGroupDetailScenarioTest.java`、`UpdateGroupNameScenarioTest.java`、`JoinGroupScenarioTest.java`、`LeaveGroupScenarioTest.java`、`AddMemberScenarioTest.java`、`RemoveMemberScenarioTest.java`、`scenario/testcontainers/AddMemberTestcontainersTest.java`、`scenario/e2e/AddMemberE2ETest.java`、`scenarios/AddMember*`。`controller/GroupControllerWebTest.java` のうち、HTTP で再現できるケース
- [ ] 変更: P1-1 と同じやり方で移す。特権ユーザー（`UNLIMITED_GROUP_UID`）のケースも含める
- [ ] 結果: group/member の AC が Go のテストに移る
- [ ] 確認 unit: Java に対して GREEN
- [ ] 確認 live: P1-1 と同じ（AC 名の差分がゼロ、わざと壊すと落ちる）
- [ ] 確認 perf: なし

## P1-3　transaction 群と精算のケース集

- [ ] 依存: P1-1
- [ ] 触るファイル
  - 追加: `acceptance/**`、`acceptance/testdata/settlement/*.json`
  - 削除: `scenario/CreateTransactionScenarioTest.java`、`GetTransactionDetailScenarioTest.java`、`UpdateTransactionScenarioTest.java`、`DeleteTransactionScenarioTest.java`、`GetTransactionHistoryScenarioTest.java`、`GetTransactionSettlementScenarioTest.java`。`controller/TransactionControllerWebTest.java` のうち、HTTP で再現できるケース
- [ ] 変更
  - P1-1 と同じやり方で移す
  - 精算のケース集を作る。固定シードの乱数で取引の組み合わせを数百件組み立て、Java の `GET /groups/{groupId}/transactions/settlement` の結果を記録する。テストは、記録した結果との一致を確かめる。このケース集は、切り替えた後も回帰テストとして残す
- [ ] 結果: transaction の AC が移り、精算の結果が Java の出力に固定される
- [ ] 確認 unit: Java に対して GREEN
- [ ] 確認 live: P1-1 と同じ。加えて、`TransactionServiceImpl` の `RoundingMode` をわざと変えると、ケース集のテストが落ちること
- [ ] 確認 perf: なし

## P1-4　exchange rate 群

- [ ] 依存: P1-1
- [ ] 触るファイル
  - 追加: `acceptance/**`、`acceptance/wiremock/**`
  - 削除: `scenario/GetExchangeRateScenarioTest.java`。`controller/ExchangeRateControllerWebTest.java` と `controller/InternalExchangeRateControllerWebTest.java` のうち、HTTP で再現できるケース
- [ ] 変更: `GET /exchange-rate/{date}` と、`X-API-Key` 付きの `POST /internal/exchange-rates` を移す。外部の為替 API が失敗したときに外から観測できる結果も含める（WireMock で再現する）
- [ ] 結果: exchange rate の AC が移る
- [ ] 確認 unit: Java に対して GREEN
- [ ] 確認 live: P1-1 と同じ
- [ ] 確認 perf: なし

---

## P2-0　試作（PR なし）

- [ ] 依存: P1-1
- [ ] 変更: `GET /exchange-rate/{date}` を、次の組み合わせで2〜3通り作って比べる。作業は使い捨てのディレクトリで行う
  - OpenAPI からのコード生成（例: oapi-codegen、ogen）
  - DB アクセス（例: sqlc、database/sql の直書き）
  - migration ツール（例: golang-migrate、goose）
- [ ] 判断基準
  - 生成されるコードの読みやすさ
  - `contracts/components/schemas/errors/ErrorResponse.yaml` に沿ったエラーを返しやすいか
  - `BINARY(16)` の UUID の扱いやすさ
  - Java が作った既存のスキーマを、実行せずに「V2 まで適用済み」として登録できるか
- [ ] 結果: このファイルの「決定事項」に、選んだものと理由を追記する。試作のコードは残さない
- [ ] 確認 live: それぞれの候補で、P1-4 の該当テストを流した結果を表にまとめる

## P2-1　Go の土台

- [ ] 依存: P2-0
- [ ] 触るファイル
  - 追加: `go.mod`、`cmd/api/**`、`internal/**`（構成は P2-0 で決める）、`db/migrations/**`（V1 と V2 のコピー）、メッセージファイル（`messages*.properties` のコピー）、`Dockerfile.go`
  - 変更: `acceptance/compose.yaml`（Go を追加）、`.github/workflows/ci.yml`（Go のビルドとテスト、コピーの同一性チェック）
- [ ] 変更
  - 環境変数は Java と同じ名前を使う（`MYSQLHOST`、`MYSQLPORT`、`MYSQLDATABASE`、`MYSQLUSER`、`MYSQLPASSWORD`、`FIREBASE_SERVICE_ACCOUNT_KEY`、`FIREBASE_PROJECT_ID`、`LAMBDA_API_KEY`、`EXCHANGE_RATE_API_KEY`、`UNLIMITED_GROUP_UID`、`PORT`）
  - ヘルスチェックは Go 独自の `/health` にする。`/actuator/health` の互換は作らない
  - 認証
    - Firebase の ID トークンを、失効チェック付きで検証する（Java の `TatecaAuthenticationFilter.java:153` と同じ）。aud と iss も確認する
    - `/internal/**` は、API キーを定数時間で比較する
    - `x-uid` による迂回は、dev のときだけ有効にする
  - エラーの形式は ErrorResponse に合わせる。メッセージはコピーした `messages*.properties` を読み、`Accept-Language` で切り替える（既定は日本語）
  - 壊れた JSON、415、存在しないパスに対して、Java と同じエラーを返す
  - 構造化ログと trace（W3C traceparent）
  - migration はコマンドとして用意するだけにして、サーバーの起動時には実行しない
  - CI では、`db/migrations` と Java の `src/main/resources/db/migration`、およびメッセージファイルが同じ内容かを diff で確かめる
- [ ] 結果: 認証とエラー処理を備えた Go のサーバーが起動する（ハンドラはまだない）
- [ ] 確認 unit: 認証の単体テスト（失効チェック、aud と iss、API キー、dev 以外では `x-uid` が効かないこと）
- [ ] 確認 live: テストのうち認証まわりの AC（各機能の「未認証は拒否」など）が、Go に対して GREEN
- [ ] 確認 perf: なし

## P2-2　auth/user（Go）

- [ ] 依存: P2-1
- [ ] 触るファイル: `internal/**`
- [ ] 変更: auth/user の5つのエンドポイントを実装する。Java の `@Transactional` の範囲を、Go の明示的なトランザクションに対応させる
- [ ] 結果: auth/user が Go で動く
- [ ] 確認 unit: ドメインロジックがあれば、その単体テスト
- [ ] 確認 live: auth/user のテストが Go に対して GREEN。流し分けを両方向で実行して GREEN（GIVEN=Java・WHEN/THEN=Go、GIVEN=Go・WHEN/THEN=Java）
- [ ] 確認 perf: なし

## P2-3　group/member（Go）

- [ ] 依存: P2-2、P1-2
- [ ] 触るファイル: `internal/**`
- [ ] 変更: group/member の7つのエンドポイントを実装する
- [ ] 結果: group/member が Go で動く
- [ ] 確認 unit: ドメインロジックの単体テスト
- [ ] 確認 live: group/member のテストが Go に対して GREEN。流し分けを両方向で GREEN
- [ ] 確認 perf: なし

## P2-4　transaction（Go）

- [ ] 依存: P2-3、P1-3
- [ ] 触るファイル: `internal/**`
- [ ] 変更: transaction の6つのエンドポイントを実装する。精算の丸めは、Java の `BigDecimal` + `RoundingMode` と同じ結果になるようにする
- [ ] 結果: transaction が Go で動く
- [ ] 確認 unit: 精算計算の単体テスト
- [ ] 確認 live: transaction のテストが Go に対して GREEN。精算のケース集がすべて一致する。流し分けを両方向で GREEN
- [ ] 確認 perf: なし

## P2-5　exchange rate（Go）

- [ ] 依存: P2-1、P1-4
- [ ] 触るファイル: `internal/**`
- [ ] 変更: `GET /exchange-rate/{date}` と `POST /internal/exchange-rates` を実装する。外部 API の retry（3回、1秒から倍々に待つ）と fallback も移す
- [ ] 結果: exchange rate が Go で動く
- [ ] 確認 unit: retry と fallback の単体テスト
- [ ] 確認 live: exchange rate のテストが Go に対して GREEN。流し分けを両方向で GREEN
- [ ] 確認 perf: なし

---

## P3　staging でのリハーサル

- [ ] 依存: P1 と P2 のすべて
- [ ] 触るファイル
  - tateca-backend: `.github/workflows/cd.yml`（Go のイメージを GHCR に push し、Railway の staging にデプロイする）、`acceptance/**`（本物の Firebase ID トークンで認証できるようにする）
  - tateca-ios: `money-me-ios/src/Config/EnvConfig.swift`（開発ビルド用に STAGING を追加）
- [ ] 変更
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
  - 30 分間リクエストを止めた後の、最初のリクエストのレイテンシを記録する（P5-2 で使う）
- [ ] 人の確認: 結果を見て、P4 に進むかどうかを人が判断する

## P4　本番の切り替え（人の go が必要）

- [ ] 依存: P3、人の go
- [ ] 触るファイル
  - tateca-config: `cloudflare-public/ios/v1/app-config.json`（`maintenance.enabled`。1.47.0 以降のアプリが読む）、`firebase-public/ios/maintenance_mode.json`（`is_maintenance`。1.47.0 より前のアプリが読む）。どちらも main に push すると自動でデプロイされる
  - tateca-backend: `.github/workflows/cd.yml`（本番用の Go サービス）
  - AWS: keep-alive の EventBridge ルール（コードは変えず、有効・無効を切り替えるだけ）
- [ ] 前日まで: 本番用の Go サービスを、ドメインを付けずに Railway に用意しておく。DB のバックアップ手順を確かめる。メンテナンスのメッセージと終了予定時刻（04:00 JST）を用意する
- [ ] 手順
  1. 02:00 に、新旧両方の config でメンテナンスを ON にする。両方の URL を curl して ON になっていることを確かめる
  2. keep-alive の EventBridge ルールを無効にする
  3. Java を止め、`api.tateca.net` の割り当てを外す
  4. DB のバックアップを取る
  5. Go の migration ツールに、V2 まで適用済みとして登録する（スキーマは変えない）
  6. Go を起動し、Railway がサービスごとに発行する URL に対して、テスト用アカウントで動作確認する。読み取り（`GET /auth/users/{uid}`、`GET /groups/list`、`GET /groups/{groupId}`、精算）と、書き込み1本（取引の作成 → 取得 → 削除）
  7. `api.tateca.net` を Go に付け、6 と同じ確認をする
  8. 新旧両方の config でメンテナンスを OFF にし、curl で確かめる
  9. 監視する。Better Stack のエラー率、09:01 JST の為替更新（`GET /exchange-rate/{当日}`）、iOS の実機での主要な流れ
- [ ] 戻し方 A（メンテナンス中に失敗した場合）: ドメインを Go から外して Java に付け、Java を起動してから、メンテナンスを OFF にする。この時点ではユーザーの書き込みがないので、データの心配はない
- [ ] 戻し方 B（メンテナンスを明けてから1週間以内）: メンテナンスを ON にしてから、A と同じ手順を踏み、メンテナンスを OFF にする。Go が書いたデータを Java が読めることは、流し分けで確認済み
- [ ] 結果: 本番が Go で動く
- [ ] 確認 live: 手順 6、7、9 がすべて通る
- [ ] 確認 perf: 切り替え前1週間の Java の p95（Better Stack）と比べる。切り替え後1日の Go の p95 が 10% 以上悪化していたら、原因を調べる

---

## P5-1　Java の削除（P4 から1週間後）

- [ ] 依存: P4 から1週間が経ち、戻していないこと
- [ ] 触るファイル
  - 削除: `src/`、`build.gradle.kts`、`settings.gradle.kts`、`gradle.properties`、`gradle/`、`gradlew`、`gradlew.bat`、`config/`、`Dockerfile`
  - 名前変更: `Dockerfile.go` を `Dockerfile` にする
  - 変更: `.github/workflows/ci.yml` と `cd.yml`（Java のジョブとコピーの同一性チェックを削除）、`acceptance/**`（`GIVEN_BASE_URL` を削除）、`acceptance/compose.yaml`（Java を削除）、`AGENTS.md`、`CLAUDE.md`、`README.md`
  - Railway: 停止していた Java のサービスを削除する
- [ ] 結果: tateca-backend が Go だけになる
- [ ] 確認 unit: CI が Go だけで GREEN
- [ ] 確認 live: CD で staging にデプロイし、テストを staging に流して GREEN
- [ ] 確認 perf: なし

## P5-2　keep-alive の整理

- [ ] 依存: P5-1
- [ ] 触るファイル: tateca-infrastructure の `lib/tateca-batch-stack.ts`、`lib/tateca-monitoring-stack.ts`（keep-alive を参照している場合）、`src/lambda/railway-keep-alive/**`
- [ ] 変更: P3 で測った「リクエストが止まった後の最初のレイテンシ」で判断する。問題がなければ、keep-alive の Lambda とルールを削除する。問題があれば、呼び先を `/health` に向け直し、レスポンスの検証を Go の形式に合わせる
- [ ] 結果: keep-alive を削除するか、Go の `/health` に向けた状態になる
- [ ] 確認 live: `cdk diff` に意図した変更だけが出る。デプロイ後にアラームが出ない
- [ ] 確認 perf: なし

## P5-3　docs の整理

- [ ] 依存: P5-1
- [ ] 触るファイル
  - tateca-workspace: `docs/specs/*/design.md` と `docs/specs/*/reviews/`（削除）、`docs/specs/*/requirements.md`（「なぜ」と「やらないこと」だけに縮める）、`docs/STEERING.md`（技術スタックを更新）、このファイル（削除）
  - tateca-backend: `AGENTS.md`（存在しないパスへの参照を直す）
- [ ] 結果: 文書が Go の実態に合い、移行のためだけの文書がなくなる
- [ ] 確認 live: 文書が参照しているパスがすべて存在する
- [ ] 確認 perf: なし

---

## Go で静かにずれやすい点（レビューの観点）

| 点 | Java 側の実態 | どこで捕まえるか |
|---|---|---|
| 精算の丸め | `BigDecimal` + `RoundingMode`（`TransactionServiceImpl.java:36`） | P1-3 のケース集、P2-4 |
| JSON の型と必須項目 | BigDecimal の桁、timestamp の形式、null と欠落の違い | OpenAPI による検証、P3 の iOS 実機での確認 |
| UUID のバイト順 | `BINARY(16)` と、`bin_to_uuid` で作られる列 | 流し分け（Java が書いたデータを Go が読む、その逆） |
| フレームワークが返すエラー | 壊れた JSON、415、バリデーションの field メッセージ（英語の文） | P1 のテスト、P2-1 |
| トークンの検証 | 失効チェック付き、aud と iss の確認（`TatecaAuthenticationFilter.java:153`） | P2-1 の単体テスト、P3 の本物のトークン |
| 多言語 | `Accept-Language`、既定は日本語 | テストで ja と en の両方を流す |
| 特権ユーザー | `UNLIMITED_GROUP_UID` にはグループの上限がない | P1-2 の既存 AC（CreateGroup Req3 AC2） |

## この計画に含めないもの

- SDD スキルの廃止と `tateca-mode` の作成（別の作業として進める）
- iOS で、フォアグラウンドに戻ったときにメンテナンスを再確認する改善（今後のメンテナンス全般に効く改善として、別のタスクにする）
- web のメンテナンス表示（メンテナンス中は web の読み取りがエラーになるが、これを許容する）
