import type { Grapheme } from "../../../types/prompts/grapheme.interface.ts";
import type { TextRange } from "../../../types/prompts/selection.interface.ts";

export function findLineRange(text: string, units: readonly Grapheme[], index: number): TextRange {
  const offset = units[index]?.start ?? 0;
  const start = offset === 0 ? 0 : text.lastIndexOf("\n", offset - 1) + 1;
  const newline = text.indexOf("\n", offset);
  return [start, newline < 0 ? text.length : newline + 1];
}
