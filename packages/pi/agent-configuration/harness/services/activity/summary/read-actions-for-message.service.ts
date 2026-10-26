import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import type { ActivityActionSummary } from "../../../types/activity/summary/activity-action-summary.interface.ts";
import { isHarnessTool } from "../../tools/active-tools/is-harness-tool.service.ts";
import { readMessageEntries } from "../messages/read-message-entries.service.ts";

export function readActionsForMessage(messageNumber: number): ActivityActionSummary[] {
  return readMessageEntries(messageNumber).flatMap((entry) => {
    const isTaskTool = entry.toolName === TASK_TOOL_NAME;
    if (!isTaskTool && !isHarnessTool(entry.toolName)) return [];
    return [{ status: entry.status }];
  });
}
