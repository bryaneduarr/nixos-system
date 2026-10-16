import type { DiffStats } from "../../../types/tools/diff/diff-stats.interface.ts";
import { countLines } from "./count-lines.service.ts";
import { emptyDiff } from "./empty-diff.service.ts";

export function replacementDiff(oldText: string, newText: string): DiffStats {
  if (oldText === newText) return emptyDiff();
  return { added: countLines(newText), removed: countLines(oldText) };
}
