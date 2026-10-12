// Fails if any dependency in a package.json or pyproject.toml is not pinned to an exact version.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const errors = [];

const dirs = [
  root,
  ...["apps", "packages"].flatMap((d) =>
    existsSync(join(root, d)) ? readdirSync(join(root, d)).map((n) => join(root, d, n)) : [],
  ),
];

for (const dir of dirs) {
  const pkg = join(dir, "package.json");
  if (existsSync(pkg)) {
    const json = JSON.parse(readFileSync(pkg, "utf8"));
    for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
      for (const [name, v] of Object.entries(json[field] ?? {})) {
        if (!/^(\d+\.\d+\.\d+(-[\w.]+)?|workspace:\*|catalog:.*|npm:.+@\d+\.\d+\.\d+)$/.test(v))
          errors.push(`${pkg}: ${name}@${v} is not an exact version`);
      }
    }
  }
  const py = join(dir, "pyproject.toml");
  if (existsSync(py)) {
    // Only look at dependency arrays, not requires-python.
    for (const m of readFileSync(py, "utf8").matchAll(
      /^\s*(?:dependencies|dev|requires)\s*=\s*\[([\s\S]*?)\]/gm,
    ))
      for (const s of m[1].matchAll(/"([^"]+)"/g))
        if (!/^[\w.-]+(\[[^\]]+\])?==[\w.]+$/.test(s[1]) && s[1] !== "api")
          errors.push(`${py}: "${s[1]}" is not pinned with ==`);
  }
}

if (errors.length) {
  console.error(`${errors.join("\n")}\n\nPin all dependencies to exact versions.`);
  process.exit(1);
}
