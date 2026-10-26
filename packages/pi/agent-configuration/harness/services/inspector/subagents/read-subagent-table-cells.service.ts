import type { Theme } from "@earendil-works/pi-coding-agent";
import { EMPTY_VALUE_LABEL } from "../../../constants/inspector/detail/label.constant.ts";
import { ROW_NUMBER_WIDTH } from "../../../constants/inspector/format/format.constant.ts";
import { SUBAGENT_STATUS_TEXT } from "../../../constants/inspector/labels/subagent-status.constant.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import type { SubagentTableCells } from "../../../types/inspector/lists/subagent-table-cells.interface.ts";
import { formatDuration } from "../format/format-duration.service.ts";
import { contextUsageLabel } from "../labels/context/context-usage-label.service.ts";
import { modelShortLabel } from "../labels/model/model-short-label.service.ts";
import { spentTokensLabel } from "../labels/usage/spent-tokens-label.service.ts";
import { readSubagentElapsed } from "./read-subagent-elapsed.service.ts";
import { readSubagentStatus } from "./read-subagent-status.service.ts";

export function readSubagentTableCells(
  row: ToolActivity,
  rowNumber: number,
  theme: Pick<Theme, "fg">,
): SubagentTableCells {
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
