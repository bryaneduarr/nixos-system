import { NEWLINE_CHARACTER } from "../../../constants/prompts/text.constant.ts";
import type { Grapheme } from "../../../types/prompts/grapheme.interface.ts";
import type { TextRange } from "../../../types/prompts/selection.interface.ts";

export function findLineRange(text: string, units: readonly Grapheme[], index: number): TextRange {
  const unit = units[index];
  const unitStart = unit === undefined ? 0 : unit.start;
  const start = unitStart === 0 ? 0 : text.lastIndexOf(NEWLINE_CHARACTER, unitStart - 1) + 1;
  const newline = text.indexOf(NEWLINE_CHARACTER, unitStart);
  return [start, newline < 0 ? text.length : newline + 1];
}
