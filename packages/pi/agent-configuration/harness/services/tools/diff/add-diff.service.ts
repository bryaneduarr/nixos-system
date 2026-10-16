import type { DiffStats } from "../../../types/tools/diff/diff-stats.interface.ts";

export function addDiff(a: DiffStats, b: DiffStats): DiffStats {
  return { added: a.added + b.added, removed: a.removed + b.removed };
}
