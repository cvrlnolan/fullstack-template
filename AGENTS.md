# AGENTS.md

Guide for AI coding agents and humans working in this repo. `CLAUDE.md` imports this file.

## What this is

A pnpm + uv monorepo for AI-powered fullstack apps: Next.js frontends, a FastAPI backend, and a generated, typed OpenAPI contract between them.

```
apps/web                Next.js (App Router, Tailwind v4)
apps/api                FastAPI + Anthropic SDK        src/api/{core,db,models,schemas,services,routers}
packages/api-client     openapi.json + generated types + typed fetch client/operations
packages/ui             shared shadcn components + theme contract (no design values)
packages/tsconfig       shared tsconfig presets
scripts/                check-pins.mjs, init-project.mjs (one-time, deletes itself)
```

Tooling: Node 22, pnpm 10 (workspace), uv + Python 3.13 (requires >=3.12), Biome (JS/TS/JSON/CSS), Ruff + Pyright strict (Python), Vitest (JS tests), Pytest (Python tests), Lefthook (git hooks), Docker Compose (local dev).

## Commands

```sh
pnpm install && uv sync     # setup (installs git hooks)
pnpm dev                    # docker compose: web :3000, api :8000, db :5432
pnpm dev:web / pnpm dev:api # run one app without Docker
pnpm check                  # EVERYTHING CI runs: pins, schema freshness, lint, typecheck, tests
pnpm lint:fix               # biome --write + ruff --fix + ruff format
pnpm api:schema             # regenerate openapi.json + schema.d.ts after ANY API change
```

Run `pnpm check` before declaring work done. Don't bypass hooks (`--no-verify`).

## The API contract (most important workflow)

FastAPI is the single source of truth. After changing any route or schema in `apps/api`:

1. Run `pnpm api:schema` and commit the regenerated `packages/api-client/openapi.json` and `src/schema.d.ts`.
2. Add/adjust the typed function in `packages/api-client/src/operations.ts`.
3. Use it from the frontend via `@/lib/api`.

Never hand-edit `openapi.json` or `schema.d.ts`. Never hand-write TS types that duplicate API schemas; derive from `Schemas[...]` / `OperationBody<...>`. Never `fetch` the backend directly from the web app; use the api-client. Pre-commit and CI fail if the generated files are stale.

## Backend standards (`apps/api`)

- **Layering:** `routers/` (thin HTTP) → `services/` (business logic, no FastAPI imports) → `models/` + `db/` (SQLAlchemy). `schemas/` holds Pydantic API shapes; `models/` holds ORM tables. Don't mix them or return ORM objects from routes.
- **Schemas:** every request/response model extends `ApiModel` (`schemas/base.py`): snake_case in Python, **camelCase on the wire**. Never use bare `BaseModel` or `dict` for endpoints.
- **Routes:** async; declare `operation_id` (camelCase verb+noun, e.g. `getHealth`) and `response_model` (or explicit `responses` for streams). `operation_id` becomes the client function name; renaming one is a breaking change.
- **Settings:** `core/config.py`, fields are UPPER_CASE (they are the env var names). Access via `Depends(get_settings)`; never read `os.environ` elsewhere. Add new vars to `.env.example`.
- **Typing:** Pyright is strict. Annotate everything; no `Any`/untyped dicts without a reason. Absolute imports (`from api.schemas import ...`).
- **Style:** Ruff (line length 100; rules E,F,I,UP,B,SIM,ASYNC,RUF,S,C4,PT). No `print`; no blocking calls inside `async def`.
- **Tests:** `apps/api/tests`, pytest. Must be hermetic: override `get_settings` via `app.dependency_overrides`, never hit the real model/network/DB.
- **New endpoint checklist:** schema → service → router (+ `include_router` in `main.py`) → test → `pnpm api:schema` → api-client operation.
- Database migrations (Alembic) are not set up yet; models are examples.

## Frontend standards (`apps/web`, `packages/*`)

- **TypeScript:** strict, plus `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (use `import type`). No `any`; no non-null `!` to silence errors. Use the `@/` alias inside the web app.
- **React/Next:** Server Components by default; add `"use client"` only for state/effects/browser APIs. Components are named exports in `src/components`, files kebab-case.
- **Biome** formats and lints (2 spaces, width 100). Don't add Prettier/ESLint. Run `pnpm lint:fix`.
- **Tests:** Vitest + Testing Library, colocated as `*.test.ts(x)`. Test behavior through the DOM; inject dependencies (e.g. `Chat` takes `streamChat`) rather than mocking modules globally.
- **Workspace packages ship TypeScript source** (no build step); Next compiles them through `transpilePackages`.

## Design system & styling

- Shared components live in `packages/ui` and use **only semantic Tailwind utilities** (`bg-primary`, `text-muted-foreground`, `rounded-lg`…). Never hardcode colors, radii, or fonts there.
- `@app/ui/styles.css` maps those utilities to CSS variables and defines **no values**. Each app owns its tokens in its own `globals.css` (import `@app/ui/tokens/neutral.css` as a starting point, then override). This is how each app gets a different look from the same components.
- Add shadcn components with `pnpm dlx shadcn@latest add <name> -c apps/web` (lands in `packages/ui`). Keep app-specific components in the app, not in `packages/ui`.
- A new FE app must `@import` the shared styles and add `@source` for `packages/ui/src` (see README).

## Dependencies

- **Everything is pinned to exact versions** (JS: `.npmrc` `save-exact`; Python: `==`). `pnpm check:pins` enforces it. Add Python deps with `uv add --bounds exact <pkg>` (or pin by hand); never introduce `^`, `~`, `>=`.
- Upgrade deliberately, one concern per commit, and run `pnpm check`. Commit lockfiles (`pnpm-lock.yaml`, `uv.lock`).
- New Python workspace members go in root `pyproject.toml` (`[tool.uv.workspace].members`, dependencies, `[tool.uv.sources]`). New JS packages use the `@app/` scope.

## Docker

Dockerfiles build from the repo root context (monorepo). Dev containers bind-mount source; the DB is `pgvector/pgvector` Postgres. Install steps must not require `.git`.

## Git

- Small, focused commits with imperative subjects. Commit as the configured git user; don't add `Co-Authored-By` or other attribution trailers.
- Don't commit `.env`, secrets, or generated build output (`.next`, `.venv`).
- Hooks run Biome, Ruff, the schema check and the pin check on commit; typecheck and tests on push.

## Don'ts

- Don't edit generated files; don't duplicate API types by hand; don't bypass the api-client.
- Don't add unpinned dependencies; don't add a second formatter/linter.
- Don't put values in `packages/ui` that should be per-app tokens.
- Don't make tests depend on network, real API keys, or the developer's `.env`.
