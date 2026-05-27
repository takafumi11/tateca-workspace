# tateca-workspace

Tateca の AI-agent-first SDD workspace です。SDD プロセス、フィーチャー仕様、OpenAPI 契約、API Docs 生成/公開をこのリポジトリで管理します。

実装は [`tateca-backend`](../tateca-backend) に残します。

## What This Repo Is For

- 共有 SDD プロセス文書とテンプレート
- Tateca プロダクトの feature specs (`products/tateca/docs/specs/`)
- Tateca API Contract (`products/tateca/contracts/internal-api/`)
- API Docs の lint / preview / GitHub Pages 公開

## Initial Setup

1. このリポジトリを clone し、エディタで開く。
2. [`LOCAL_REPOSITORY_LINKS.template.md`](LOCAL_REPOSITORY_LINKS.template.md) を `LOCAL_REPOSITORY_LINKS.md` にコピーする。
3. ローカルの `tateca-backend` などの checkout パスを記入する。

`LOCAL_REPOSITORY_LINKS.md` はローカル専用で gitignore されます。

## Agent Rules

- [`AGENTS.md`](AGENTS.md) が共有エージェント挙動の source of truth です。
- クロスリポジトリ実装では `LOCAL_REPOSITORY_LINKS.md` を先に読むこと。
- `LOCAL_REPOSITORY_LINKS.md` が未作成、または `TBU` が残っている場合は推測せず開発者に確認すること。

## Main Entry Points

- `platform/docs/sdd-process.md`: normal SDD process
- `platform/docs/sdd-reverse-process.md`: reverse SDD process
- `platform/docs/testing.md`: shared test strategy
- `products/tateca/docs/specs/`: feature requirements and design
- `products/tateca/contracts/internal-api/`: OpenAPI contract

## API Docs

- Production: [docs.tateca.net](https://docs.tateca.net)
- Local preview: `cd products/tateca && npm ci && npm run preview`

## Migration Note

このリポジトリは `tateca-backend` から SDD 文書と OpenAPI/API Docs をコピー移行して作成しました。Git 履歴は引き継いでいません。
