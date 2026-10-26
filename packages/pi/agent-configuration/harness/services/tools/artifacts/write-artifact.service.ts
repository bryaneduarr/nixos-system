import { writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { WORK_DIR } from "../../../constants/tools/artifacts/workspace.constant.ts";
import type { ArtifactWriteRequest } from "../../../types/tools/artifacts/artifact-write-request.interface.ts";
import { nextArtifactId } from "./next-artifact-id.service.ts";

export async function writeArtifact(request: ArtifactWriteRequest): Promise<string> {
  const { cwd, kind, extension, content } = request;
  const dir = join(cwd, WORK_DIR, kind);
  const id = await nextArtifactId(dir);
  const path = join(dir, `${id}.${extension}`);
  await writeFile(path, content, "utf8");
  return relative(cwd, path);
}
