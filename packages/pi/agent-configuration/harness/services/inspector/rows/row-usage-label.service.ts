import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import { usageLabel } from "../labels/usage/usage-label.service.ts";

export function rowUsageLabel(row: InspectorRow, tool: string): string {
  if (row.level === "sub" || tool !== TASK_TOOL_NAME) return "";
  return `  ${usageLabel(row.entry.usage, row.entry.model)}`;
}
