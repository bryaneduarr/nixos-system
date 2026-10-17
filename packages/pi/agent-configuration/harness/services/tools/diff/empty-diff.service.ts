import type { DiffStats } from "../../../types/tools/diff/diff-stats.interface.ts";

export function emptyDiff(): DiffStats {
  return { added: 0, removed: 0 };
}
