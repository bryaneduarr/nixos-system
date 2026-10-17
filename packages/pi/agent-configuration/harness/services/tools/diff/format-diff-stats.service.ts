import type { DiffStats } from "../../../types/tools/diff/diff-stats.interface.ts";

export function formatDiffStats(stats: DiffStats): string {
  return `+${stats.added} -${stats.removed}`;
}
