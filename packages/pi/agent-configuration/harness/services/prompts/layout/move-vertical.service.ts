import type { DisplayCell, DisplayRow } from "../../../types/prompts/display-row.interface.ts";
import type { PromptNavigation } from "../../../types/prompts/prompt-navigation.interface.ts";
import { cursorRow } from "./cursor-row.service.ts";

function isCellEndingAfter(cell: DisplayCell, column: number): boolean {
  return cell.column + Math.max(1, cell.width) > column;
}

export function moveVertical(navigation: PromptNavigation, rows: readonly DisplayRow[], delta: number): void {
  const current = cursorRow(rows, navigation.cursor);
  const currentRow = rows[current];
  if (currentRow === undefined) return;
  const column = currentRow.find((cell) => cell.index === navigation.cursor)?.column ?? 0;
  const target = rows[Math.max(0, Math.min(rows.length - 1, current + delta))];
  if (target === undefined) return;
  const cell = target.find((candidate) => isCellEndingAfter(candidate, column)) ?? target.at(-1);
  navigation.move(cell?.index ?? navigation.units.length - 1);
}
