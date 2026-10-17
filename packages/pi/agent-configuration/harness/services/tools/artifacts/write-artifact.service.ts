import { writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { WORK_DIR } from "../../../constants/tools/workspace.constant.ts";
import { nextArtifactId } from "./next-artifact-id.service.ts";

export async function writeArtifact(cwd: string, kind: string, extension: string, content: string): Promise<string> {
  const dir = join(cwd, WORK_DIR, kind);
  const id = await nextArtifactId(dir);
  const path = join(dir, `${id}.${extension}`);
  await writeFile(path, content, "utf8");
  return relative(cwd, path);
}
