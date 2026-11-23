# tateca-workspace

Tateca のプロダクト全体の正本を置くリポジトリです。要件と受け入れ基準（AC）、作業中の計画、エージェント用のスキルを管理します。

実装は、同じ親ディレクトリに並べた各リポジトリ（`../tateca-backend`、`../tateca-web`、`../tateca-ios` など）にあります。

## 構成

| パス | 内容 | 主に読む人 |
|---|---|---|
| `product/overview.md` | Tateca とは何か、ドメインの全体像、要件の一覧 | 全員 |
| `product/requirements/` | ドメインごとの要件と AC。振る舞いについて合意した正本 | PdM・Biz・エンジニア |
| `contracts/`、`openapi.yaml` | 凍結した手書きの OpenAPI。正ではなく、Go 移行の後に削除する | （参照しない） |
| `plans/` | 作業中の計画。作業が終わったら削除する | エンジニア |
| `.claude/skills/` | エージェント用のスキル | AI エージェント |

## はじめに

1. Tateca のリポジトリを、同じ親ディレクトリに並べて clone する。tateca-workspace、tateca-backend、tateca-web、tateca-ios、tateca-infrastructure、tateca-config の6つ。
2. このリポジトリを開き、`product/overview.md` から読む。

### 開発環境の準備

backend の acceptance テスト（`tateca-backend/acceptance/run`）を流すには、次のツールが要ります。

| ツール | 用途 |
|---|---|
| Docker（compose v2） | MySQL、WireMock、Java のサーバーを起動する |
| JDK 25 | Java のサーバーをビルドする |
| Go 1.27 以上 | acceptance テストと、その確認ツール |
| jq、python3 | `acceptance/run` とテストの補助 |
| gh | GitHub の PR と issue。リポジトリの所有アカウントでログインする |

- Docker のファイル共有がホームディレクトリだけの場合（Rancher Desktop の既定など）、ホームの外に置いたリポジトリや worktree はマウントできない。worktree はホームの下に作る。
- push や認証に machine 固有の手順がある場合は、このリポジトリには書かず、その machine の `~/.claude/rules/` などに置く。

### Claude Code の準備

1. pstack のプラグインを入れ、`/pstack:setup-pstack` で、その machine で使えるモデルを設定する。
2. tateca-mode のスキルをリンクする：`ln -s <親ディレクトリ>/tateca-workspace/.claude/skills/tateca-mode ~/.claude/skills/tateca-mode`
3. 実装の作業は、実装のリポジトリで `/tateca-mode` から始める。進め方は [`AGENTS.md`](AGENTS.md) にある。

エージェントの振る舞いは [`AGENTS.md`](AGENTS.md) に従います。

## API の形とエラー

API の形と、エンドポイントごとに返りうるエラーは、backend のコードで宣言し、テストで確かめます。OpenAPI は、外部に渡す必要が出たときにコードから生成します。手書きの OpenAPI から作っている docs.tateca.net は更新を止めており、Go 移行の後に片付けます。
