import { TASK_TOOL_NAME } from "../../../../constants/subagents/roles/roles.constant.ts";
import type { ToolResultStatusInput } from "../../../../types/activity/parsing/tool-result/tool-result-status-input.interface.ts";
import type { ActivityStatus } from "../../../../types/activity/store/activity-status.interface.ts";
import { resultFailed } from "../../../tool-rendering/presentation/result-failed.service.ts";
import { isHarnessTool } from "../../../tools/active-tools/is-harness-tool.service.ts";

export function readToolResultStatus(input: ToolResultStatusInput): ActivityStatus {
  const isFailedTask = input.toolName === TASK_TOOL_NAME && input.taskFailed;
  const isFailedHarnessTool = isHarnessTool(input.toolName) && resultFailed(input.toolName, input.text);
  const isErrorResult = input.isError || isFailedTask || isFailedHarnessTool;
  return isErrorResult ? "error" : "success";
}
