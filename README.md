# tateca-workspace

Tateca のプロダクト全体の正本を置くリポジトリです。要件と受け入れ基準（AC）、API 契約、作業中の計画、エージェント用のスキルを管理し、API ドキュメント（docs.tateca.net）を生成・公開します。

実装は、同じ親ディレクトリに並べた各リポジトリ（`../tateca-backend`、`../tateca-web`、`../tateca-ios` など）にあります。

## 構成

| パス | 内容 | 主に読む人 |
|---|---|---|
| `product/overview.md` | Tateca とは何か、ドメインの全体像、要件の一覧 | 全員 |
| `product/requirements/` | ドメインごとの要件と AC。振る舞いについて合意した正本 | PdM・Biz・エンジニア |
| `contracts/`、`openapi.yaml` | API 契約。docs.tateca.net の生成元 | エンジニア・フロントエンド |
| `plans/` | 作業中の計画。作業が終わったら削除する | エンジニア |
| `.claude/skills/` | エージェント用のスキル | AI エージェント |

## はじめに

1. Tateca のリポジトリを、同じ親ディレクトリに並べて clone する。
2. このリポジトリを開き、`product/overview.md` から読む。

エージェントの振る舞いは [`AGENTS.md`](AGENTS.md) に従います。

## API ドキュメント

- 本番: [docs.tateca.net](https://docs.tateca.net)
- ローカルでのプレビュー: `npm ci && npm run preview`
