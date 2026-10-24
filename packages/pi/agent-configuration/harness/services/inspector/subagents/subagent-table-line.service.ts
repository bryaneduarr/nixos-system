import { TWO_SPACES } from "../../../constants/inspector/lists/spacing.constant.ts";
import { SUBAGENT_TABLE_COLUMNS } from "../../../constants/inspector/lists/subagent-table.constant.ts";
import type { SubagentTableCells } from "../../../types/inspector/lists/subagent-table-cells.interface.ts";
import { padCell } from "../../split-view/layout/pad-cell.service.ts";

export function subagentTableLine(cells: SubagentTableCells): string {
  return SUBAGENT_TABLE_COLUMNS.map((column) => padCell(cells[column.key], column.width)).join(TWO_SPACES);
}
