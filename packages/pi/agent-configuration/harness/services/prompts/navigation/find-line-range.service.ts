import { NEWLINE_CHARACTER, TEXT_START_OFFSET } from "../../../constants/prompts/text.constant.ts";
import type { Grapheme } from "../../../types/prompts/navigation/grapheme.interface.ts";
import type { TextRange } from "../../../types/prompts/navigation/selection.interface.ts";

function lineRangeAt(text: string, offset: number): TextRange {
  const start = offset === 0 ? 0 : text.lastIndexOf(NEWLINE_CHARACTER, offset - 1) + 1;
  const newline = text.indexOf(NEWLINE_CHARACTER, offset);
  return [start, newline < 0 ? text.length : newline + 1];
}

export function findLineRange(text: string, units: readonly Grapheme[], index: number): TextRange {
  const unit = units[index];
  if (unit === undefined) return lineRangeAt(text, TEXT_START_OFFSET);
  return lineRangeAt(text, unit.start);
}
