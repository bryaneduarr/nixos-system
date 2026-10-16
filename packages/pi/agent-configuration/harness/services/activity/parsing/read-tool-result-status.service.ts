import { TASK_TOOL_NAME } from "../../../constants/subagents/roles.constant.ts";
import type { ActivityStatus } from "../../../types/activity/activity-status.interface.ts";
import type { ToolResultStatusInput } from "../../../types/activity/tool-result-status-input.interface.ts";
import { resultFailed } from "../../tool-rendering/presentation/result-failed.service.ts";
import { isHarnessTool } from "../../tools/is-harness-tool.service.ts";

export function readToolResultStatus(input: ToolResultStatusInput): ActivityStatus {
  const isFailedTask = input.toolName === TASK_TOOL_NAME && input.taskFailed;
  const isFailedHarnessTool = isHarnessTool(input.toolName) && resultFailed(input.toolName, input.text);
  const isErrorResult = input.isError || isFailedTask || isFailedHarnessTool;
  return isErrorResult ? "error" : "success";
}
