# Fullstack Template

pnpm + uv monorepo for AI-powered fullstack apps.

```
apps/
  web/          Next.js (App Router, Tailwind v4) — proxies /api/* to the API
  api/          FastAPI + Anthropic SDK (managed by uv)
packages/
  shared/       TS types shared across JS apps
  tsconfig/     Shared tsconfig presets
pyproject.toml  uv workspace root + ruff / pyright / pytest config
biome.json      Lint/format for JS/TS/JSON/CSS
lefthook.yml    pre-commit (biome, ruff) and pre-push (typecheck, test)
docker-compose.yml   web + api + Postgres (pgvector)
```

## Getting started

Requires Node 22+, pnpm 10+, uv, Docker.

```sh
cp .env.example .env     # add ANTHROPIC_API_KEY
pnpm install             # also installs git hooks (lefthook)
uv sync
pnpm dev                 # docker compose: web :3000, api :8000, db :5432
```

Without Docker: `pnpm dev:api` and `pnpm dev:web` in separate terminals.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm lint` / `lint:fix` | biome + ruff |
| `pnpm typecheck` | tsc + pyright (strict) |
| `pnpm test` | pytest (+ any JS `test` scripts) |
| `pnpm check` | all of the above |

## Adding things

- **JS app/package**: create `apps/<name>` or `packages/<name>` with a `package.json` named `@app/<name>`; the pnpm workspace picks it up. Add its `Dockerfile` + compose service if needed.
- **Python app/lib**: create it with its own `pyproject.toml`, add it to `[tool.uv.workspace].members` in the root `pyproject.toml` (and as a root dependency + `[tool.uv.sources]` entry so `uv run` sees it).
- **API router**: add a module under `apps/api/src/api/routers/` and include it in `main.py`.
- Keep `packages/shared` types aligned with `apps/api/src/api/schemas.py` (or generate from the OpenAPI spec at `/openapi.json`).
