import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function readPackagePath(): string {
  const packagePath = process.argv[2];
  if (!packagePath) throw new Error("Pi package path is required");
  return packagePath;
}

export function replaceOnce(path: string, before: string, after: string): void {
  const source = readFileSync(path, "utf8");
  const first = source.indexOf(before);
  const duplicate = source.indexOf(before, first + before.length);
  if (first < 0 || duplicate >= 0) {
    throw new Error(`Expected exactly one match for the patch target in ${path}`);
  }
  writeFileSync(path, source.replace(before, after));
}

export function findBundledChunkContaining(packagePath: string, needle: string): string {
  const chunksPath = join(packagePath, "dist/bundle/chunks");
  const matches = readdirSync(chunksPath)
    .filter((name) => name.endsWith(".js"))
    .map((name) => join(chunksPath, name))
    .filter((path) => readFileSync(path, "utf8").includes(needle));
  const [match] = matches;
  if (matches.length !== 1 || match === undefined) {
    throw new Error(`Expected one bundled chunk containing the patch target, found ${matches.length}`);
  }
  return match;
}
