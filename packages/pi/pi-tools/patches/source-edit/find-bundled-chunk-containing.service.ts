import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
