import type { SubagentTableCells } from "../../../types/inspector/lists/subagent-table-cells.interface.ts";
import type { SubagentTableColumn } from "../../../types/inspector/lists/subagent-table-column.interface.ts";

/** Columns of the subagents table in display order. */
export const SUBAGENT_TABLE_COLUMNS: readonly SubagentTableColumn[] = [
  { key: "number", width: 3 },
  { key: "status", width: 10 },
  { key: "time", width: 11 },
  { key: "context", width: 19 },
  { key: "spent", width: 7 },
  { key: "model", width: 24 },
  { key: "reasoning", width: 9 },
];
/** Heading row of the subagents table. */
export const SUBAGENT_TABLE_HEADINGS: SubagentTableCells = {
  number: "#",
  status: "STATUS",
  time: "TIME",
  context: "CONTEXT",
  spent: "SPENT",
  model: "MODEL",
  reasoning: "REASONING",
};
/** Key hints shown above the subagents table. */
export const SUBAGENT_TABLE_HINT = "↑/↓ move  l or enter open";
