// Generates src/schema.d.ts from openapi.json (which is exported by the FastAPI app).
//   node scripts/generate.mjs          write
//   node scripts/generate.mjs --check  exit 1 if src/schema.d.ts is stale
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const pkgDir = new URL("..", import.meta.url).pathname;
const input = join(pkgDir, "openapi.json");
const output = join(pkgDir, "src/schema.d.ts");
const bin = join(pkgDir, "node_modules/.bin/openapi-typescript");

if (process.argv.includes("--check")) {
  const tmp = mkdtempSync(join(tmpdir(), "api-client-"));
  try {
    const out = join(tmp, "schema.d.ts");
    execFileSync(bin, [input, "-o", out, "--default-non-nullable", "false"], { stdio: "ignore" });
    if (readFileSync(out, "utf8") !== readFileSync(output, "utf8")) {
      console.error("src/schema.d.ts is stale. Run `pnpm api:schema` and commit the result.");
      process.exit(1);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
} else {
  execFileSync(bin, [input, "-o", output, "--default-non-nullable", "false"], { stdio: "inherit" });
}
