import { TASK_TOOL_NAME } from "../../../../constants/subagents/roles/roles.constant.ts";
import { formatLegacyTaskInput } from "./format-legacy-task-input.service.ts";
import { formatMissionInput } from "./format-mission-input.service.ts";
import { formatValue } from "./format-value.service.ts";

export function formatInput(tool: string, args: Record<string, unknown>): string {
  if (tool !== TASK_TOOL_NAME) return formatValue(args);
  if (typeof args.mission === "string") return formatMissionInput(args);

  return formatLegacyTaskInput(args);
}
