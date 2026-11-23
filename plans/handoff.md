# Go 移行の引き継ぎ（2026-11-23）

別の machine の Claude Code に作業を引き継ぐためのメモです。backend と workspace の両方のセッションの引き継ぎを、このファイルにまとめています。引き継いだ側が読み終えたら、このファイルは消します。計画の正本は [`go-migration.md`](go-migration.md) で、machine の準備は [`README.md`](../README.md) の「はじめに」にあります。

返答は日本語でお願いします。コード、コミット、PR は、各リポジトリの慣習に従います。

## 再開のしかた

tateca-backend で Claude Code を起動し、次のように頼みます。

```
/tateca-mode tateca-workspace/plans/handoff.md から再開して。まず状態を確かめて、次にやることを提案して。
```

## 終わったこと

| 内容 | どこにあるか |
|---|---|
| P1-1：acceptance の土台と access・auth-user・user のテスト。置き換えた Java のテストは削除した | tateca-backend #337（マージ済み） |
| 権限まわりの修正 | tateca-backend #338（マージ済み）。詳しくは tateca-backend の #330 |
| requirements の見直し（AC は 178 件） | tateca-workspace #5、#6（マージ済み） |
| auth-user R4-AC3 を名乗っていたテストの名前を R4-AC2 に変更 | tateca-backend #339（マージ済み） |
| P1-4：為替レートのテスト（AC 14/14）。WireMock を操作する部品（`acc.ExternalRates`）と、順番に流す手順（`s.Step`）を追加 | tateca-backend #342（マージ済み） |
| 移行中は直さずに固定しているバグ | tateca-backend の `go-migration-bug` ラベルの issue（#326、#327、#333〜#336、#340、#341） |

## 次にやること

1. `go-migration.md` の P1-4 のチェックボックスを埋める。
2. P1-2（グループとメンバー）と P1-3（取引と精算のケース集）。
   - 並行して進められる。PR ごとにセッションと worktree を分け、`ACCEPTANCE_PROJECT` も分ける。
   - 基準は、tateca-backend #338 の後の振る舞いと、このリポジトリの main の requirements。
   - P1-3 では固定の日付を使う。P1-4 の更新の流れのテストが、今日と明日のレートを書き換えるため。
3. P2-0（Go のライブラリの試作と比較）。P1-4 の為替のテストで候補を比べる。
4. 権限の修正の残り：tateca-backend #330 のコメントを参照。

### workspace の次にやること

- tateca-workspace の issue #7：PdM の判断を待っている 13 項目。決まったら、`sdd-requirements` のスキルで requirements を直す。
- requirements の PR と backend の PR を続けてマージするときは、次の順番を守る。backend の CI の AC 対応チェックは、workspace の main の requirements を読むため。tateca-backend #339 ではこの順番を外れて、CI が赤くなった。
  1. requirements の PR をマージする。
  2. backend の PR の Acceptance ジョブを流し直して、緑を確かめる。
  3. backend の PR をマージする。

## 確認が要る issue（tateca-backend）

- #333〜#336：#337 のマージで、自動で閉じられていた。#337 の本文の「not fixed: #333」の「fixed:」を、GitHub が issue を閉じる書き方として読んだため。バグは固定しただけなので、2026-11-23 に開き直した。PR やコミットで issue に触れるときは、`fix`・`close`・`resolve` のような言葉を、issue 番号の直前に置かない。
- #332：#338 で直った。閉じてよいかを、ユーザーに確かめているところ。

## 未決の提案

- P1 が終わった後に `/pstack:reflect` を流すかどうか。
- tateca-mode のスキルで、reflect を自動で始めるようにするかどうか（案 A。まだ承認されていない）。

## P1 で分かった注意点

- **AC のない振る舞い**：`acc.Pin` で固定してから、人に「意図・付随・バグ」を仕分けてもらう。バグは `go-migration-bug` の issue にし、テスト名の末尾に `#番号` を付ける。requirements と Java の振る舞いが食い違うときも、同じようにバグとして扱う。今の振る舞いを固定し、AC の ID と issue 番号を付ける。
- **golden（Java の応答の記録）**：手で直さない。`-update` で、テストが通った実行からだけ記録する。rebase した後は、`testdata/observed-errors.txt` も記録し直す。
- **requirements の基準**：ローカルの作業ツリーではなく `origin/main` にする。たとえば `git -C ../tateca-workspace archive origin/main product/requirements | tar -x -C <dir>` で取り出し、`REQUIREMENTS_DIR=<dir>/product/requirements` で `acceptance/run` に渡す。
- **作業を任せる前に、requirements の確定を待つ**：`acceptance/run` は1回 4〜5 分かかる。途中で requirements が変わると、確認を何度もやり直すことになる。
- **`acceptance/run` の使い方**：
  - `acceptance/run`：新しいスタックで全部流し、AC 対応チェックとカバレッジまで確かめる。
  - `acceptance/run up`：スタックだけ起動して、`BASE_URL`、`WIREMOCK_URL`、`LAMBDA_API_KEY` を表示する。続けて `cd acceptance && BASE_URL=... go test -count=1 -run TestX ./...` で1つだけ流せる。終わったら `acceptance/run down`。
- **為替の更新の流れのテスト**：新しいスタックでしか流れない。同じスタックの2回目は skip になる（正常な動き）。
- **PR ごとに広げるもの**：`acceptance/run` の `REQUIRED_AC_DOMAINS` と `COVERAGE_ENFORCE`。
- **前からある問題**：Java の結合テストが、使い回しの Testcontainers の MySQL に残ったデータで、ときどき落ちる。
