# 開発の流れの切り替え計画

作業中だけ置く計画ファイル。目標とする流れは T2 で `tateca-mode` スキルに移し、T3 が終わったらこのファイルを削除する。
各 PR は、そのセクションのチェックボックスがすべて埋まったときに完了とする。

## 何が変わるか

文書を先に固める SDD（Step 1〜4 とレビュー記録）から、次の形に切り替える。

- 要件と AC は requirements.md に書いて、人が合意する
- AC は black-box テストで証明する
- それ以外の進め方（調査、実装、検証、PR）は pstack に任せる

Go 移行（`plans/go-migration.md`）とは関係なく、すべてのコンポーネントに当てはまる。

## 目標とする流れ

### 何が正か

| 対象 | 正本 | 書く人・直す人 | ずれを防ぐ仕組み |
|---|---|---|---|
| 要件と AC（何を、なぜ、やらないこと） | `product/requirements/{spec}.md` | PdM が書き、人が承認する | AC の ID とテストの対応を、CI で両方向から確かめる |
| AC を満たしていることの証明 | black-box テスト | エンジニア | 同上 |
| API の形と、エンドポイントごとに返りうるエラー | backend のコード（ハンドラーの型と、エラーの宣言） | エンジニア。クライアントに見える変化は、PR の差分を見て人が判断する | 宣言外のエラーコードは型で返せない。宣言とテストの観測を両方向で比べる。OpenAPI は外部に渡す必要が出たときに、宣言から生成する |
| AC で決めていない細部 | コード | エンジニア | なし |
| 技術判断の理由 | PR とコミット（大きな判断は ADR） | エンジニア | なし |

- requirements.md・テスト・コードが食い違ったら、requirements.md に合わせる。requirements.md 自体を変える場合は、PdM の承認が必要。
- design.md とレビュー記録は作らない。設計に迷ったときは、pstack の `/architect` や試作で決め、理由を PR に書く。

### requirements.md のルール

- 正本はドメイン単位で1つ（例: `group`、`transaction`）。機能単位で重複させない。
- 書くこと: 目的と背景（なぜ）、範囲とやらないこと、要件（User Story）と AC（GIVEN/WHEN/THEN）、その機能の用語。
- 書かないこと: 処理の流れ、DB、HTTP の細部、実装の都合。ここがずれの元になる。書き分けは `sdd-requirements` の基準に従う。
- AC の ID は本文に書いて固定する（`### R{n}: <題名>` の下に `- **R{n}-AC{m}** GIVEN ...`）。文書の外からは `{spec} R{n}-AC{m}`（例: `group R2-AC9`）で参照する。ID は振り直さず、削除した番号も再利用しない。
- 業務上の意味がある上限や条件（グループの人数上限など）は AC に書く。形式だけの規則（UUID や日付の形式）は AC にしない。
- 画面の振る舞い（表示、入力、遷移、エラーの見せ方）の AC は、同じ文書の「画面の要件」節に `FR{n}-AC{m}` として書く。ドメインの AC を言い直さない。

### 作業の種類ごとの流れ

| 作業 | 流れ | 使う pstack の playbook |
|---|---|---|
| 新規機能 | requirements.md を新しく書く（PdM が承認）→ AC ごとに ID 付きの black-box テストを書く（RED）→ 実装する（GREEN）→ verify スキルで実物を確かめる → PR に「なぜ」を書く（レスポンスの形やエラーの宣言が変わるなら、その差分を人が確かめる） | Feature |
| 既存機能の改修 | 既存の requirements.md を直す（その差分を PdM がレビューする）→ 変わる AC のテストを先に直す（RED）→ 実装する → 実物を確かめる → PR | Feature |
| requirements.md がない既存機能を変える | 触る範囲を `/how` と `/why` で理解する → 今の振る舞いを特性テストで固定する → requirements.md の下書きを作る → 人が「意図したもの・偶然そうなっているもの・バグ」に仕分ける → 意図したものを AC にする（PdM が承認）→ ここから先は「既存機能の改修」と同じ | Investigation、Refactoring の pin、Feature |
| バグ修正 | 実物で再現する → AC が漏れていたなら、AC を足すかどうかを PdM が決める → 失敗するテストを書く → 直す | Bug fix |
| リファクタリング | 振る舞いを固定してから、構造だけを変える。requirements.md は変わらない | Refactoring |
| 調査 | `/how`、`/why`、`/teach` | Investigation |

### 人の関門

1. requirements.md の承認（PdM）
2. クライアントに見える API の変化（レスポンスの形、エンドポイントごとのエラー）。古いバージョンの iOS アプリが叩き続けるので、実質的に元に戻せない
3. マージ

### AC とテストの対応チェック

- テストは、確かめた AC の ID を持つ。1つのテストが複数の AC を確かめてもよい。
- CI で、テストを実行して確かめた AC の ID と、requirements.md の AC 一覧を両方向で比べる。「テストのない AC がある」「存在しない AC を指すテストがある」のどちらでも CI を落とす。
- backend の仕組みは、Go 移行の P1-1 で作る。web と iOS には、それぞれのテストが揃った時点で同じ仕組みを入れる。
- エラーについても同じ形で確かめる。テストで観測した「エンドポイントとエラーコードの組」と、backend のコードにあるエラーの宣言を両方向で比べる（Go 移行の P2-1 で作る）。
- iOS のモデルと backend のレスポンスのずれは、backend のテストが記録したレスポンスを iOS のテストで decode して確かめる（任意。OpenAPI がなくても検出できる）。

### RSF（Reverse Spec Flow）を使う条件

次の条件が多く当てはまる範囲にだけ使う。当てはまらない範囲は、`/how` と `/why` で十分。

1. 手元で動かせない
2. テストがない
3. 大きくて、全体像を誰も持っていない
4. 一度に広い範囲を変える

主な使いどころは2つ。requirements.md がない既存機能の下書きを作るとき（引用された行を見て、人が確かめやすい）と、Go 移行のように全体の振る舞いを固定するとき。作った仕様は使い終わったら削除し、保守はしない。

### スキルと文書の扱い

| 対象 | 扱い |
|---|---|
| `sdd-requirements` | 残した。新しい構成、ID の形式、「既存の振る舞いから下書きする」流れに合わせて書き直し済み |
| `sdd-design-and-contract` | 削除済み。API の形とエラーはコードで宣言するので、契約を手で書くスキルは作らない |
| `sdd-black-box-test`、`sdd-tdd` | 削除済み。pstack の Feature、Bug fix、`/tdd` と、`tateca-mode` に置き換える |
| `sdd-reverse-requirements` | 削除済み。`sdd-requirements` の「既存の振る舞いから下書きする」流れと、RSF の下書きに置き換えた |
| `sdd-reverse-design-and-contract`、`sdd-reverse-black-box-test`、`sdd-reverse-tdd` | 削除済み |
| `tateca-mode`（新規） | pstack の `poteto-mode` に従ったうえで、上の流れ・関門・AC とテストのルールだけを足す（T2） |
| `docs/` 全体（SDD のプロセス文書、テスト戦略、frontend の文書、テンプレート、STEERING.md、agent-skill-guide） | 削除済み。製品の概要は `product/overview.md` に、リポジトリの地図と作業のルールは `AGENTS.md` に移した |

## PR の順番と依存関係

```
T1 → T2 → T3
T4（独立。iOS で機能開発を始める前）
```

| ID | リポジトリ | 内容 | 依存 |
|---|---|---|---|
| T1 | tateca-workspace | スキルを git で管理する | なし |
| T2 | tateca-workspace | `tateca-mode` を作り、実際の変更で試す | T1 |
| T3 | tateca-workspace、各リポジトリ | 古いスキルと文書を整理する | T2 |
| T4 | tateca-ios | iOS の verify スキル | なし |

---

## T1　スキルを git で管理する（完了: コミット `0ad7681`）

- [x] 依存: なし
- [x] 触るファイル: `.gitignore`（`.claude/*` を ignore したうえで `.claude/skills/` だけを外す）、`.claude/skills/**`（今の SDD スキルをそのままコミットした）
- [x] 変更: 今のスキルをそのまま履歴に残してから変えた。以後、Tateca のスキルの正本は workspace とする
- [x] 結果: スキルの変更が、PR の差分として見えるようになった
- [x] 確認 live: コミット対象に、ローカル専用の設定ファイルが入っていないことを確かめた
- [x] 確認 perf: なし

## T2　`tateca-mode` を作り、実際の変更で試す

- [ ] 依存: T1
- [ ] 触るファイル: `.claude/skills/tateca-mode/**`。`~/.claude/skills/tateca-mode` から symlink を張り、Tateca のどのリポジトリからでも使えるようにする
- [ ] 変更
  - `/pstack:poteto-mode tateca-mode スキルを書いて` で、pstack のスキル作成の playbook を使って作る。入力はこのファイルの「目標とする流れ」
  - 中身は、`poteto-mode` に足す Tateca 固有のルールだけにする（人の関門、requirements.md と AC のルール、AC とテストの対応、リポジトリをまたぐ作業で `../<リポジトリ名>` を使う決まり）
- [ ] 結果: `/tateca-mode` で作業を始めると、上の流れに沿って進む
- [ ] 確認 live
  - 実際の小さな変更を1つ、`tateca-mode` で最後までやり切る（requirements.md → テスト → 実装 → 実物の確認 → PR）
  - Go 移行中は backend に新機能を入れないので、試す変更は web の小さな変更にするか、Go 移行の P1-1（AC とテストの対応のルールを使う）にする
  - 終わったら `/pstack:reflect` で、学んだことを `tateca-mode` に反映する
- [ ] 確認 perf: なし

## T3　古いスキルと文書を整理する

workspace 側は、ワークスペースの構成変更で T2 より先に済ませた（構成を変えたので、古い文書とスキルが参照するパスがなくなったため）。

- [ ] 依存: workspace 側はなし。他のリポジトリ側は T2
- [ ] 触るファイル
  - [x] tateca-workspace: 「スキルと文書の扱い」の表のとおり削除し、`AGENTS.md`、`CLAUDE.md`、`README.md` を書き直した。`docs/` は `product/` に置き換えた
  - [ ] tateca-backend、tateca-web、tateca-ios: `AGENTS.md` にテストの慣習と、workspace の `product/requirements/` への参照を書く。backend の `AGENTS.md` にある、存在しないパスへの参照を直す
- [x] 変更: 置き換え済みのスキルと文書を、まとめて削除した。新旧を並べて残していない
- [ ] 結果: 開発の流れが `tateca-mode`、`sdd-requirements`、pstack だけで完結する
- [ ] 確認 live: workspace の文書とスキルが参照しているパスが、すべて存在する（workspace 側は確認済み。凍結した `contracts/` の説明文に残る design.md への言及は、Go 移行の P5-3 で `contracts/` ごと削除する）。新しいセッションで「既存機能の改修」を `tateca-mode` で始めると、requirements の更新から始まる
- [ ] 確認 perf: なし

T3 の時点で T4 が終わっていなければ、T4 を tateca-ios の issue に移してから、このファイルを削除する。

## T4　iOS の verify スキル

- [ ] 依存: なし（iOS で機能開発を始める前に済ませる）
- [ ] 触るファイル: tateca-ios の `.claude/skills/verify-tateca-ios/**`
- [ ] 変更: tateca-ios で `/pstack:create-verification-skill` を実行し、シミュレータでアプリを操作する手順と、機能マップを作る
- [ ] 結果: どのエージェントでも、同じ手順で iOS アプリを起動して操作できる
- [ ] 確認 live: 生成のときに一度通しで動かす。起動 → グループのホーム画面の表示 → 取引一覧の表示ができ、スクリーンショットが証拠として残る
- [ ] 確認 perf: なし
