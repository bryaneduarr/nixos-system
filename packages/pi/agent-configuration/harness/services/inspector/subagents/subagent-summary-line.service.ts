import { SUBAGENT_TABLE_HINT } from "../../../constants/inspector/lists/subagent-table.constant.ts";
import type { ToolActivityUsage } from "../../../types/activity/parsing/subagent/tool-activity-usage.interface.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import { formatTokens } from "../format/format-tokens.service.ts";
import { readSubagentStatus } from "./read-subagent-status.service.ts";

function reportedTotalTokens(usage: ToolActivityUsage): number {
  return usage.usageState === "reported" ? usage.usage.totalTokens : 0;
}

export function subagentSummaryLine(rows: readonly ToolActivity[]): string {
  const runningCount = rows.filter((row) => readSubagentStatus(row) === "running").length;
  const totalTokens = rows.reduce((total, row) => total + reportedTotalTokens(row.usage), 0);
  const counts = `${rows.length} subagents  ${runningCount} running  ${formatTokens(totalTokens)} tokens spent`;
  return `${counts}    ${SUBAGENT_TABLE_HINT}`;
}
