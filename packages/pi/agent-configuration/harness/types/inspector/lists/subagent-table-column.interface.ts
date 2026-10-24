import type { SubagentTableCells } from "./subagent-table-cells.interface.ts";

/** One column of the subagents table. */
export interface SubagentTableColumn {
  /** Cell shown in this column. */
  readonly key: keyof SubagentTableCells;
  /** Width of the column in terminal columns. */
  readonly width: number;
}
