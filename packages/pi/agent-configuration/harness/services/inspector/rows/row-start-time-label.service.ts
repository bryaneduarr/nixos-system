import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import { formatTime } from "../format/format-time.service.ts";

export function rowStartTimeLabel(
  row: InspectorRow,
  call: { readonly toolName: string; readonly startedAt: number },
): string {
  const isSubagentCall = row.level === "sub" || call.toolName === TASK_TOOL_NAME;
  return isSubagentCall ? `  ${formatTime(call.startedAt)}` : "";
}
