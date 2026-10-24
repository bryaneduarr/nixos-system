import type { Grapheme } from "../../../types/prompts/navigation/grapheme.interface.ts";
import type { TextRange } from "../../../types/prompts/navigation/selection.interface.ts";

export function findSelectionSpan(units: readonly Grapheme[], low: number, high: number): TextRange {
  const first = units[low];
  const last = units[high];
  if (first === undefined || last === undefined) return [0, 0];
  return [first.start, last.end];
}
