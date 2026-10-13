#!/usr/bin/env node
// Scaffolds a new project from the bundled template.
//   npm create @cvrlnolan/fullstack my-app
//   npx @cvrlnolan/create-fullstack my-app [--no-install] [--no-git]
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    "no-install": { type: "boolean", default: false },
    "no-git": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

const USAGE = `Usage: create-fullstack <project-name> [options]

  <project-name>   kebab-case, e.g. acme-portal (also the directory name)
  --no-install     only copy files; skip installs and renaming (prints next steps)
  --no-git         don't run \`git init\` / initial commit
  -h, --help       show this help`;

const fail = (msg) => {
  console.error(`\n${msg}\n`);
  process.exit(1);
};

if (flags.help) {
  console.log(USAGE);
  process.exit(0);
}
const name = positionals[0];
if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name))
  fail(`Invalid or missing project name.\n\n${USAGE}`);

const target = resolve(process.cwd(), name);
if (existsSync(target) && readdirSync(target).length > 0)
  fail(`Directory "${name}" already exists and is not empty.`);

const template = join(dirname(fileURLToPath(import.meta.url)), "..", "template");
if (!existsSync(template))
  fail(
    "Template files are missing from this package (run `npm run bundle` when working from a git checkout).",
  );

const has = (cmd) => spawnSync(cmd, ["--version"], { stdio: "ignore" }).status === 0;
function run(cmd, args) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd: target, stdio: "inherit" });
  if (r.status !== 0) fail(`\`${cmd} ${args.join(" ")}\` failed.`);
}

// 1. Copy, restoring the dotfiles npm refuses to publish.
console.log(`Creating ${name} in ${target}`);
cpSync(template, target, { recursive: true });
for (const [from, to] of [
  ["_gitignore", ".gitignore"],
  ["_npmrc", ".npmrc"],
]) {
  if (existsSync(join(target, from))) renameSync(join(target, from), join(target, to));
}

// 2. Install + rename (needs pnpm and uv).
const manual = `\nNext steps:\n  cd ${name}\n  cp .env.example .env\n  pnpm install && uv sync\n  pnpm init:project ${name}\n  pnpm dev\n`;
if (flags["no-install"]) {
  console.log(manual);
  process.exit(0);
}
const missing = ["pnpm", "uv"].filter((c) => !has(c));
if (missing.length) {
  console.log(
    `\nMissing required tools: ${missing.join(", ")}. Install them (https://pnpm.io, https://docs.astral.sh/uv/), then:${manual}`,
  );
  process.exit(0);
}

if (!flags["no-git"] && has("git")) run("git", ["init", "-q", "-b", "main"]);
run("pnpm", ["install", "--frozen-lockfile"]);
run("uv", ["sync", "--frozen"]);
run("node", ["scripts/init-project.mjs", name]);

if (existsSync(join(target, ".env.example")) && !existsSync(join(target, ".env"))) {
  cpSync(join(target, ".env.example"), join(target, ".env"));
}
if (!flags["no-git"] && has("git")) {
  run("git", ["add", "-A"]);
  // Hooks were just installed by pnpm; skip them for the scaffold commit since it is already formatted.
  run("git", [
    "commit",
    "-q",
    "--no-verify",
    "-m",
    "Initial commit from @cvrlnolan/create-fullstack",
  ]);
}

console.log(`\nDone! Next:\n  cd ${name}\n  # add ANTHROPIC_API_KEY to .env\n  pnpm dev\n`);
