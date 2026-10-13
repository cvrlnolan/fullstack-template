// One-time setup for a repo created from this template:
//   pnpm init:project my-app
// Renames the project, refreshes lockfile/schema, and removes this script, the template notes and tools/create-fullstack.
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error("Usage: pnpm init:project <kebab-case-name>   e.g. pnpm init:project acme-portal");
  process.exit(1);
}
const title = name
  .split("-")
  .map((w) => w[0].toUpperCase() + w.slice(1))
  .join(" ");

function edit(file, fn) {
  const before = readFileSync(file, "utf8");
  const after = fn(before);
  if (before === after)
    throw new Error(`init: nothing to change in ${file} (already initialized?)`);
  writeFileSync(file, after);
}
const run = (cmd) => execSync(cmd, { stdio: "inherit" });

edit("package.json", (s) => {
  const json = JSON.parse(s);
  json.name = name;
  delete json.scripts["init:project"];
  return `${JSON.stringify(json, null, 2)}\n`;
});
edit("pyproject.toml", (s) => s.replace('name = "fullstack-template"', `name = "${name}"`));
edit("apps/api/src/api/main.py", (s) => s.replace('title="API"', `title="${title} API"`));
edit("apps/web/src/app/layout.tsx", (s) => s.replaceAll("Fullstack Template", title));
edit("apps/web/src/app/page.tsx", (s) => s.replaceAll("Fullstack Template", title));
edit("README.md", (s) =>
  s
    .replace("# Fullstack Template", `# ${title}`)
    .replace(/<!-- template:start -->[\s\S]*?<!-- template:end -->\n*/, ""),
);

rmSync("scripts/init-project.mjs");
// The scaffolding CLI only makes sense in the template repo itself.
if (existsSync("tools/create-fullstack")) rmSync("tools/create-fullstack", { recursive: true });
if (existsSync("tools") && readdirSync("tools").length === 0) rmSync("tools", { recursive: true });

run("uv lock");
run("pnpm api:schema");
run("pnpm exec biome check --write .");
console.log(`\nInitialized "${name}". Review with \`git diff\`, then commit.`);
