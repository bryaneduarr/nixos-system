import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const packageDirectory = process.argv[2];
const hostPackages = ["@earendil-works/pi-tui", "typebox"];

if (!packageDirectory) throw new Error("LSP adapter package path is required");

const manifestPath = join(packageDirectory, "package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

manifest.peerDependencies ??= {};

for (const name of hostPackages) {
  delete manifest.dependencies?.[name];
  manifest.peerDependencies[name] = "*";
  rmSync(join(packageDirectory, "node_modules", name), { recursive: true, force: true });
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
