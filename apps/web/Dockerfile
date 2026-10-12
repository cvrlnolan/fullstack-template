# Build context is the repo root (pnpm workspace).
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /repo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/tsconfig/package.json packages/tsconfig/
RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile --filter @app/web...
COPY packages packages

FROM base AS dev
WORKDIR /repo/apps/web
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]

FROM base AS build
COPY apps/web apps/web
RUN pnpm --filter @app/web build

FROM node:22-slim AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
USER node
CMD ["node", "apps/web/server.js"]
