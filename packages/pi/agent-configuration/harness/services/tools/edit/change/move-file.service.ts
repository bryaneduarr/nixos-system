import { mkdir, rename } from "node:fs/promises";
import { dirname } from "node:path";
import type { EditResult } from "../../../../types/tools/edit/edit-result.interface.ts";
import type { MoveChange } from "../../../../types/tools/edit/move-change.interface.ts";
import { isReadableFile } from "../../path/is-readable-file.service.ts";
import { resolveToolPath } from "../../path/resolve-tool-path.service.ts";

export async function moveFile(cwd: string, change: MoveChange, target: string): Promise<EditResult> {
  const destination = resolveToolPath(cwd, change.destination);
  if (destination === target) {
    return { summary: "Move failed: source and destination are identical.", changed: false };
  }
  const destinationExists = await isReadableFile(destination);
  if (destinationExists && !change.overwrite) {
    return {
      summary: `Move failed: ${change.destination} already exists (set overwrite=true to replace).`,
      changed: false,
    };
  }
  try {
    await mkdir(dirname(destination), { recursive: true });
    await rename(target, destination);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { summary: `Move failed: ${message}`, changed: false };
  }
  return {
    summary: `Moved:\n${change.path} -> ${change.destination}`,
    changed: true,
  };
}
