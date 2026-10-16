import type { Grapheme } from "../../../types/prompts/grapheme.interface.ts";
import type { TextRange } from "../../../types/prompts/selection.interface.ts";

export function findLineEdgeIndex(units: readonly Grapheme[], line: TextRange, end: boolean): number {
  const [lineStart, lineStop] = line;
  const firstIndex = units.findIndex((unit) => unit.start >= lineStart);
  if (!end) return firstIndex;
  let index = firstIndex;
  for (const [offset, unit] of units.entries()) {
    if (offset < firstIndex) continue;
    if (unit.start >= lineStop) break;
    if (!unit.text.includes("\n")) index = offset;
  }
  return index;
}
