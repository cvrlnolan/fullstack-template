// Snapshots the repo (git-tracked files, minus tools/) into ./template for publishing.
// Runs automatically on `npm pack` / `npm publish` (prepack).
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgDir = join(here, "..");
const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: pkgDir })
  .toString()
  .trim();
const out = join(pkgDir, "template");

// npm never publishes these dotfiles, so they ship under an underscore name and are renamed on scaffold.
const RENAMED = new Set([".gitignore", ".npmrc"]);
const EXCLUDE = (f) => f.startsWith("tools/");

rmSync(out, { recursive: true, force: true });
const files = execFileSync("git", ["ls-files", "-z"], { cwd: repoRoot })
  .toString()
  .split("\0")
  .filter((f) => f && !EXCLUDE(f));

for (const f of files) {
  const base = f.split("/").pop();
  const dest = join(out, RENAMED.has(base) ? f.replace(/(^|\/)\./, "$1_") : f);
  if (!statSync(join(repoRoot, f)).isFile()) continue;
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(join(repoRoot, f), dest);
}
console.log(`Bundled ${files.length} files into ${out}`);
