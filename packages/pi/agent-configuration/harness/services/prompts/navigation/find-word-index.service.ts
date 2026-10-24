import type { Grapheme } from "../../../types/prompts/navigation/grapheme.interface.ts";

const WORD_CHARACTER_PATTERN = /[\p{L}\p{N}_]/u;
const WHITESPACE_ONLY_PATTERN = /^\s+$/u;

function isWordUnit(units: readonly Grapheme[], index: number): boolean {
  const unit = units[index];
  return unit !== undefined && WORD_CHARACTER_PATTERN.test(unit.text);
}

function isSpaceUnit(units: readonly Grapheme[], index: number): boolean {
  const unit = units[index];
  return unit !== undefined && WHITESPACE_ONLY_PATTERN.test(unit.text);
}

function findNextWordStart(units: readonly Grapheme[], cursor: number): number {
  let index = cursor;
  const kind = isWordUnit(units, index);
  while (index < units.length && !isSpaceUnit(units, index) && isWordUnit(units, index) === kind) index++;
  while (index < units.length && isSpaceUnit(units, index)) index++;
  return index;
}

function findPreviousWordStart(units: readonly Grapheme[], cursor: number): number {
  let index = cursor - 1;
  while (index > 0 && isSpaceUnit(units, index)) index--;
  const kind = isWordUnit(units, index);
  while (index > 0 && !isSpaceUnit(units, index - 1) && isWordUnit(units, index - 1) === kind) index--;
  return index;
}

export function findWordIndex(units: readonly Grapheme[], cursor: number, direction: number): number {
  return direction > 0 ? findNextWordStart(units, cursor) : findPreviousWordStart(units, cursor);
}
