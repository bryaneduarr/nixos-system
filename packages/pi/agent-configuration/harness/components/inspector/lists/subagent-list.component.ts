import type { Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { ROW_NUMBER_WIDTH } from "../../../constants/inspector/format.constant.ts";
import { EMPTY_VALUE_LABEL } from "../../../constants/inspector/label.constant.ts";
import { SUBAGENT_STATUS_TEXT } from "../../../constants/inspector/subagent-status.constant.ts";
import {
  SUBAGENT_TABLE_COLUMNS,
  SUBAGENT_TABLE_GAP,
  SUBAGENT_TABLE_HEADINGS,
  SUBAGENT_TABLE_HINT,
} from "../../../constants/inspector/subagent-table.constant.ts";
import { TRUNCATION_MARK } from "../../../constants/split-view/text.constant.ts";
import { THEME_DIM, THEME_MUTED } from "../../../constants/split-view/theme-color.constant.ts";
import { formatDuration } from "../../../services/inspector/format/format-duration.service.ts";
import { formatTokens } from "../../../services/inspector/format/format-tokens.service.ts";
import { contextUsageLabel } from "../../../services/inspector/labels/context/context-usage-label.service.ts";
import { modelShortLabel } from "../../../services/inspector/labels/model/model-short-label.service.ts";
import { spentTokensLabel } from "../../../services/inspector/labels/usage/spent-tokens-label.service.ts";
import { isSubagentSelected } from "../../../services/inspector/subagents/is-subagent-selected.service.ts";
import { readSubagentElapsed } from "../../../services/inspector/subagents/read-subagent-elapsed.service.ts";
import { readSubagentStatus } from "../../../services/inspector/subagents/read-subagent-status.service.ts";
import { padCell } from "../../../services/split-view/layout/pad-cell.service.ts";
import type { ToolActivityUsage } from "../../../types/activity/parsing/subagent/tool-activity-usage.interface.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import type { SubagentListOptions } from "../../../types/inspector/lists/subagent-list-options.interface.ts";
import type { SubagentTableCells } from "../../../types/inspector/lists/subagent-table.interface.ts";
import { listRow } from "../../split-view/list-row.component.ts";

function tableLine(cells: SubagentTableCells): string {
  return SUBAGENT_TABLE_COLUMNS.map((column) => padCell(cells[column.key], column.width)).join(SUBAGENT_TABLE_GAP);
}

function subagentCells(row: ToolActivity, rowNumber: number, theme: Pick<Theme, "fg">): SubagentTableCells {
  const status = SUBAGENT_STATUS_TEXT[readSubagentStatus(row)];
  return {
    number: String(rowNumber).padStart(ROW_NUMBER_WIDTH, "0"),
    status: theme.fg(status.color, status.label),
    time: formatDuration(readSubagentElapsed(row)),
    context: contextUsageLabel(row.usage, row.model),
    spent: spentTokensLabel(row.usage),
    model: modelShortLabel(row.model),
    reasoning: row.thinkingLevel.state === "present" ? row.thinkingLevel.value : EMPTY_VALUE_LABEL,
  };
}

function reportedTotalTokens(usage: ToolActivityUsage): number {
  return usage.usageState === "reported" ? usage.usage.totalTokens : 0;
}

function summaryLine(rows: readonly ToolActivity[]): string {
  const runningCount = rows.filter((row) => readSubagentStatus(row) === "running").length;
  const totalTokens = rows.reduce((total, row) => total + reportedTotalTokens(row.usage), 0);
  const counts = `${rows.length} subagents  ${runningCount} running  ${formatTokens(totalTokens)} tokens spent`;
  return `${counts}    ${SUBAGENT_TABLE_HINT}`;
}

export function renderSubagentList({ rows, width, height, scroll, selection, theme }: SubagentListOptions): string[] {
  const output = [
    theme.fg(THEME_MUTED, truncateToWidth(summaryLine(rows), width, TRUNCATION_MARK, true)),
    theme.fg(THEME_DIM, truncateToWidth(tableLine(SUBAGENT_TABLE_HEADINGS), width, TRUNCATION_MARK, true)),
  ];
  for (const [index, row] of rows.slice(scroll, scroll + height).entries()) {
    const line = tableLine(subagentCells(row, scroll + index + 1, theme));
    output.push(listRow({ text: line, width, isSelected: isSubagentSelected(row, selection), theme }));
  }
  return output;
}
