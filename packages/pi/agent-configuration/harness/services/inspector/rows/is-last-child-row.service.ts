import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";

export function isLastChildRow(row: InspectorRow, rows: readonly InspectorRow[], index: number): boolean {
  const nextRow = rows[index + 1];
  if (nextRow === undefined) return true;

  return nextRow.level !== "sub" || nextRow.entry.id !== row.entry.id;
}
