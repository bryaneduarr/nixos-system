import type { DisplayCell, DisplayRow } from "../../../types/prompts/display-row.interface.ts";
import type { PromptNavigation } from "../../../types/prompts/prompt-navigation.interface.ts";
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

export function moveVertical(navigation: PromptNavigation, rows: readonly DisplayRow[], delta: number): void {
  const current = cursorRow(rows, navigation.cursor);
  const currentRow = rows[current];
  if (currentRow === undefined) return;
  const cursorCell = currentRow.find((cell) => cell.index === navigation.cursor);
  const column = cursorCell === undefined ? 0 : cursorCell.column;
  const target = rows[Math.max(0, Math.min(rows.length - 1, current + delta))];
  if (target === undefined) return;
  navigation.move(findTargetCellIndex(target, column, navigation.units.length - 1));
}
