import { readFile, unlink } from "node:fs/promises";
import type { DeleteChange } from "../../../../types/tools/edit/delete-change.interface.ts";
import type { EditResult } from "../../../../types/tools/edit/edit-result.interface.ts";
import { countLines } from "../../diff/count-lines.service.ts";
import { formatDiffStats } from "../../diff/format-diff-stats.service.ts";

export async function deleteFile(change: DeleteChange, target: string): Promise<EditResult> {
  let content: string;
  try {
    content = await readFile(target, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { summary: `Delete failed: ${message}`, changed: false };
  }
  await unlink(target);
  return {
    summary: `Deleted:\n${change.path}\n\n${formatDiffStats({
      added: 0,
      removed: countLines(content),
    })}`,
    changed: true,
  };
}
