# Build context is the repo root (uv workspace).
FROM python:3.13-slim AS base
COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /bin/uv
ENV UV_LINK_MODE=copy UV_COMPILE_BYTECODE=1 UV_PROJECT_ENVIRONMENT=/opt/venv PATH="/opt/venv/bin:$PATH"
WORKDIR /repo
COPY pyproject.toml uv.lock ./
COPY apps/api/pyproject.toml apps/api/pyproject.toml
# Deps first for layer caching; source is copied/mounted afterwards.
RUN --mount=type=cache,target=/root/.cache/uv \
    mkdir -p apps/api/src/api && touch apps/api/src/api/__init__.py && \
    uv sync --frozen --no-dev --package api

FROM base AS dev
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --package api
WORKDIR /repo/apps/api
CMD ["fastapi", "dev", "--host", "0.0.0.0", "src/api/main.py"]

FROM base AS prod
COPY apps/api apps/api
WORKDIR /repo/apps/api
RUN useradd -m app && chown -R app /repo
USER app
CMD ["fastapi", "run", "src/api/main.py", "--port", "8000"]
