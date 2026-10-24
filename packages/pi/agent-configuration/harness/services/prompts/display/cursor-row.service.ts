import type { DisplayRow } from "../../../types/prompts/display/display-row.interface.ts";

export function cursorRow(rows: readonly DisplayRow[], cursor: number): number {
  return Math.max(
    0,
    rows.findIndex((row) => row.some((cell) => cell.index === cursor)),
  );
}
