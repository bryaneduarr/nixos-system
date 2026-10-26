import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { CreateChange } from "../../../../types/tools/edit/create-change.interface.ts";
import type { EditResult } from "../../../../types/tools/edit/edit-result.interface.ts";
import { countLines } from "../../diff/count-lines.service.ts";
import { formatDiffStats } from "../../diff/format-diff-stats.service.ts";
import { isReadableFile } from "../../path/is-readable-file.service.ts";

export async function createFile(change: CreateChange, target: string): Promise<EditResult> {
  const alreadyExists = await isReadableFile(target);
  if (alreadyExists && !change.overwrite) {
    return {
      summary: `Create failed: ${change.path} already exists (set overwrite=true to replace).`,
      changed: false,
    };
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, change.content, "utf8");
  return {
    summary: `Created:\n${change.path}\n\n${formatDiffStats({
      added: countLines(change.content),
      removed: 0,
    })}`,
    changed: true,
  };
}
