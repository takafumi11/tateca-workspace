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

1. Tateca のリポジトリを、同じ親ディレクトリに並べて clone する。
2. このリポジトリを開き、`product/overview.md` から読む。

エージェントの振る舞いは [`AGENTS.md`](AGENTS.md) に従います。

## API の形とエラー

API の形と、エンドポイントごとに返りうるエラーは、backend のコードで宣言し、テストで確かめます。OpenAPI は、外部に渡す必要が出たときにコードから生成します。手書きの OpenAPI から作っている docs.tateca.net は更新を止めており、Go 移行の後に片付けます。
