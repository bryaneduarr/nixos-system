import { readFileSync, writeFileSync } from "node:fs";

export function replaceOnce(path: string, before: string, after: string): void {
  const source = readFileSync(path, "utf8");
  const first = source.indexOf(before);
  const duplicate = source.indexOf(before, first + before.length);
  if (first < 0 || duplicate >= 0) {
    throw new Error(`Expected exactly one match for the patch target in ${path}`);
  }
  writeFileSync(path, source.replace(before, after));
}
