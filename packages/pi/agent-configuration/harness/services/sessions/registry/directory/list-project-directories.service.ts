import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PROJECT_MARKER_FILE_PATTERN } from "../../../../constants/sessions/registry/registry-files.constant.ts";
import { canonicalDirectory } from "./canonical-directory.service.ts";
import { prepareRegistryDirectory } from "./prepare-registry-directory.service.ts";

export async function listProjectDirectories(directory: string): Promise<string[]> {
  await prepareRegistryDirectory(directory);
  const paths = new Set<string>();
  for (const file of await readdir(directory)) {
    if (!PROJECT_MARKER_FILE_PATTERN.test(file)) continue;
    try {
      paths.add(await canonicalDirectory(await readFile(join(directory, file), "utf8"), "/"));
    } catch {}
  }
  return [...paths].sort();
}
