@AGENTS.md

## Claude Code notes

- Treat `AGENTS.md` as the source of truth for conventions; update it (not this file) when conventions change.
- Before finishing a task, run `pnpm check` and report the real result. If you changed anything under `apps/api`, run `pnpm api:schema` first.
- Prefer the dedicated tools over shell for reading/searching. Don't run `docker compose` in sandboxes without a Docker daemon; validate with `docker compose config` instead.
- Keep changes scoped: no drive-by refactors, no new dependencies unless asked, and pin any you add.
