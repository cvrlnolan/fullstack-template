# Fullstack Template

pnpm + uv monorepo for AI-powered fullstack apps. Next.js frontends, FastAPI backend, one typed contract between them.

```
apps/
  web/                 Next.js (App Router, Tailwind v4, vitest) — proxies /api/* to the API
  api/                 FastAPI + Anthropic SDK (uv)
    src/api/
      core/            config (UPPER_CASE settings), cross-cutting infra
      db/              engine / session dependency
      models/          SQLAlchemy ORM models (tables)
      schemas/         Pydantic request/response models (camelCase on the wire)
      services/        business logic (no FastAPI imports)
      routers/         HTTP layer: thin, declares operation_id + response_model
    scripts/           export_openapi.py
packages/
  api-client/          openapi.json + generated types + typed fetch client & operations
  ui/                  shared shadcn components + theme contract (no design values)
  tsconfig/            shared tsconfig presets
```

<!-- template:start -->
## Using this template

1. On GitHub: **Use this template → Create a new repository**, then clone it.
2. `cp .env.example .env`, `pnpm install`, `uv sync`.
3. `pnpm init:project <your-name>` — renames the project (root package, Python project, API title, app title), refreshes `uv.lock` and the OpenAPI schema, then deletes itself and this section. Commit the result.
4. `pnpm dev`.

The `@app/*` workspace scope and the `app` database name are intentionally generic; keep them.

(Maintainers: enable **Settings → Template repository** on the template repo.)
<!-- template:end -->

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
| `pnpm test` | vitest (JS) + pytest (Python) |
| `pnpm api:schema` | re-export OpenAPI from FastAPI and regenerate TS types |
| `pnpm api:schema:check` | fail if the committed schema/types are stale (pre-commit + CI) |
| `pnpm check:pins` | fail if any dependency is not pinned to an exact version |
| `pnpm check` | everything above |

## API contract (backend → frontend)

FastAPI is the source of truth. The flow is:

1. Define Pydantic models in `schemas/` extending `ApiModel` (snake_case in Python, **camelCase** on the wire).
2. Give each route an `operation_id` and `response_model`.
3. `pnpm api:schema` → writes `packages/api-client/openapi.json` and `src/schema.d.ts`.
4. Add a typed function to `packages/api-client/src/operations.ts` (or call `client.GET/POST` directly — paths, params and bodies are type-checked against the schema).

The pre-commit hook runs `pnpm api:schema:check` whenever API code or the generated files change, and CI runs it too, so the contract can't drift.

## Design tokens & shared UI (shadcn)

`packages/ui` holds the shadcn components. They only use **semantic** utilities (`bg-primary`, `text-muted-foreground`, `rounded-lg`…), and `@app/ui/styles.css` maps those to CSS variables **without defining values**. Each app owns the values:

```css
/* apps/<app>/src/app/globals.css */
@import "tailwindcss";
@import "@app/ui/styles.css";
@source "../../../../packages/ui/src";
@import "@app/ui/tokens/neutral.css";   /* or your own token file */
:root { --primary: oklch(0.55 0.2 260); --radius: 0.75rem; }
```

Same components, different look per app. Add components with the shadcn CLI (`components.json` is set up for the monorepo):
`pnpm dlx shadcn@latest add dialog -c apps/web`.

## Dependency pinning

All dependencies are exact (`.npmrc` has `save-exact=true`; Python uses `==`; `pnpm check:pins` enforces it in hooks and CI). For Python add with `uv add --bounds exact <pkg>`. Upgrade deliberately and review the diff.

## Adding things

- **FE app**: `apps/<name>` with `@app/<name>`; depend on `@app/ui` and `@app/api-client`, add a `globals.css` as above.
- **Python app/lib**: own `pyproject.toml`, add to `[tool.uv.workspace].members`, and as a root dependency + `[tool.uv.sources]` entry.
- **Endpoint**: schema → service → router → `pnpm api:schema` → operation.
