import { truncateToWidth } from "@earendil-works/pi-tui";
import { SUBAGENT_TABLE_HEADINGS } from "../../../constants/inspector/lists/subagent-table.constant.ts";
import { TRUNCATION_MARK } from "../../../constants/split-view/text.constant.ts";
import { THEME_DIM, THEME_MUTED } from "../../../constants/split-view/theme-color.constant.ts";
import { isSubagentSelected } from "../../../services/inspector/subagents/is-subagent-selected.service.ts";
import { readSubagentTableCells } from "../../../services/inspector/subagents/read-subagent-table-cells.service.ts";
import { subagentSummaryLine } from "../../../services/inspector/subagents/subagent-summary-line.service.ts";
import { subagentTableLine } from "../../../services/inspector/subagents/subagent-table-line.service.ts";
import type { SubagentListOptions } from "../../../types/inspector/lists/subagent-list-options.interface.ts";
import { listRow } from "../../split-view/list-row.component.ts";

export function renderSubagentList({ rows, width, height, scroll, selection, theme }: SubagentListOptions): string[] {
  const output = [
    theme.fg(THEME_MUTED, truncateToWidth(subagentSummaryLine(rows), width, TRUNCATION_MARK, true)),
    theme.fg(THEME_DIM, truncateToWidth(subagentTableLine(SUBAGENT_TABLE_HEADINGS), width, TRUNCATION_MARK, true)),
  ];
  for (const [index, row] of rows.slice(scroll, scroll + height).entries()) {
    const line = subagentTableLine(readSubagentTableCells(row, scroll + index + 1, theme));
    output.push(listRow({ text: line, width, isSelected: isSubagentSelected(row, selection), theme }));
  }
  return output;
}
