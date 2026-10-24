import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HOST_PACKAGES = ["@earendil-works/pi-tui", "typebox"];
const HOST_PEER_RANGE = "*";

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isJsonObject(value) && Object.values(value).every((entry) => typeof entry === "string");
}

function stringRecordOrEmpty(value: unknown): Record<string, string> {
  return isStringRecord(value) ? value : {};
}

const packageDirectory = process.argv[2];
if (!packageDirectory) throw new Error("LSP adapter package path is required");

const manifestPath = join(packageDirectory, "package.json");
const parsedManifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!isJsonObject(parsedManifest)) throw new Error(`Invalid package manifest: ${manifestPath}`);

const dependencies = stringRecordOrEmpty(parsedManifest.dependencies);
const peerDependencies = stringRecordOrEmpty(parsedManifest.peerDependencies);
const remainingDependencies = Object.fromEntries(
  Object.entries(dependencies).filter(([name]) => !HOST_PACKAGES.includes(name)),
);
const hostPeerDependencies = Object.fromEntries(HOST_PACKAGES.map((name) => [name, HOST_PEER_RANGE]));

const updatedManifest = {
  ...parsedManifest,
  dependencies: remainingDependencies,
  peerDependencies: { ...peerDependencies, ...hostPeerDependencies },
};
writeFileSync(manifestPath, `${JSON.stringify(updatedManifest, null, 2)}\n`);

for (const name of HOST_PACKAGES) {
  rmSync(join(packageDirectory, "node_modules", name), { recursive: true, force: true });
}
