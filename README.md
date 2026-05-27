# tateca-workspace

Tateca の AI-agent-first SDD workspace です。SDD プロセス、フィーチャー仕様、OpenAPI 契約、API Docs 生成/公開をこのリポジトリで管理します。

実装は [`tateca-backend`](../tateca-backend) に残します。

## What This Repo Is For

- SDD プロセス文書とテンプレート (`docs/`)
- Tateca feature specs (`docs/specs/`)
- Tateca API Contract (`contracts/`, `openapi.yaml`)
- API Docs の lint / preview / GitHub Pages 公開

## Initial Setup

1. このリポジトリを clone し、エディタで開く。
2. [`LOCAL_REPOSITORY_LINKS.template.md`](LOCAL_REPOSITORY_LINKS.template.md) を `LOCAL_REPOSITORY_LINKS.md` にコピーする。
3. ローカルの `tateca-backend` などの checkout パスを記入する。

`LOCAL_REPOSITORY_LINKS.md` はローカル専用で gitignore されます。

## Agent Rules

- [`AGENTS.md`](AGENTS.md) が共有エージェント挙動の source of truth です。
- クロスリポジトリ実装では `LOCAL_REPOSITORY_LINKS.md` を先に読むこと。

## Main Entry Points

| Document | 内容 |
|----------|------|
| `docs/STEERING.md` | プロジェクト全体像 |
| `docs/sdd-process.md` | normal SDD process |
| `docs/sdd-reverse-process.md` | reverse SDD process |
| `docs/testing.md` | テスト戦略 |
| `docs/specs/` | フィーチャー別の要件・設計 |
| `openapi.yaml` | API Contract エントリポイント |

## API Docs

- Production: [docs.tateca.net](https://docs.tateca.net)
- Local preview: `npm ci && npm run preview`
