import { LINE_START_COLUMN } from "../../../constants/prompts/display.constant.ts";
import type { DisplayCell, DisplayRow } from "../../../types/prompts/display/display-row.interface.ts";
import type { PromptNavigation } from "../../../types/prompts/navigation/prompt-navigation.interface.ts";
import { cursorRow } from "./cursor-row.service.ts";

function isCellEndingAfter(cell: DisplayCell, column: number): boolean {
  return cell.column + Math.max(1, cell.width) > column;
}

function findTargetCellIndex(target: DisplayRow, column: number, fallbackIndex: number): number {
  const cell = target.find((candidate) => isCellEndingAfter(candidate, column));
  if (cell !== undefined) return cell.index;
  const lastCell = target.at(-1);
  return lastCell === undefined ? fallbackIndex : lastCell.index;
}

function cursorColumn(row: DisplayRow, cursor: number): number {
  const cursorCell = row.find((cell) => cell.index === cursor);
  if (cursorCell === undefined) return LINE_START_COLUMN;
  return cursorCell.column;
}

export function moveVertical(navigation: PromptNavigation, rows: readonly DisplayRow[], delta: number): void {
  const current = cursorRow(rows, navigation.cursor);
  const currentRow = rows[current];
  if (currentRow === undefined) return;
  const column = cursorColumn(currentRow, navigation.cursor);
  const target = rows[Math.max(0, Math.min(rows.length - 1, current + delta))];
  if (target === undefined) return;
  navigation.move(findTargetCellIndex(target, column, navigation.units.length - 1));
}
