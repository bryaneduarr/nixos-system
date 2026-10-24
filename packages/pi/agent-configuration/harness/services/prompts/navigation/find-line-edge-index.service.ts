import { NEWLINE_CHARACTER } from "../../../constants/prompts/text.constant.ts";
import type { Grapheme } from "../../../types/prompts/navigation/grapheme.interface.ts";
import type { TextRange } from "../../../types/prompts/navigation/selection.interface.ts";

export function findLineEdgeIndex(units: readonly Grapheme[], line: TextRange, toLineEnd: boolean): number {
  const [lineStart, lineEnd] = line;
  const firstIndex = units.findIndex((unit) => unit.start >= lineStart);
  if (!toLineEnd) return firstIndex;
  let index = firstIndex;
  for (const [offset, unit] of units.entries()) {
    if (offset < firstIndex) continue;
    if (unit.start >= lineEnd) break;
    if (!unit.text.includes(NEWLINE_CHARACTER)) index = offset;
  }
  return index;
}
