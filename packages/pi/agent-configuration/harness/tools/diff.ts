export interface DiffStats {
  added: number;
  removed: number;
}

export function emptyDiff(): DiffStats {
  return { added: 0, removed: 0 };
}

export function addDiff(a: DiffStats, b: DiffStats): DiffStats {
  return { added: a.added + b.added, removed: a.removed + b.removed };
}

export function countLines(text: string): number {
  if (text.length === 0) return 0;
  return text.split(/\r?\n/).length;
}

export function replacementDiff(oldText: string, newText: string): DiffStats {
  if (oldText === newText) return emptyDiff();
  const removed = countLines(oldText);
  const added = countLines(newText);
  return { added, removed };
}

export function formatDiffStats(stats: DiffStats): string {
  return `+${stats.added} -${stats.removed}`;
}
