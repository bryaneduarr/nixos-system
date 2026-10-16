import { TASK_TOOL_NAME } from "../../../constants/subagents/roles.constant.ts";
import type { ActivityStatus } from "../../../types/activity/activity-status.interface.ts";
import type { HydrateToolResultInput } from "../../../types/activity/hydrate-tool-result-input.interface.ts";
import { taskResultFailed } from "../../subagents/tasks/task-result-failed.service.ts";
import { resultFailed } from "../../tool-rendering/presentation/result-failed.service.ts";
import { extractText } from "../../tool-rendering/text/extract-text.service.ts";
import { isHarnessTool } from "../../tools/is-harness-tool.service.ts";
import { readToolResultFields } from "../parsing/read-tool-result-fields.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";

export function hydrateToolResult(input: HydrateToolResultInput): void {
  const { id, message, cwd, startedAt } = input;
  const lookup = activityStore.lookup(id);
  const toolName =
    typeof message.toolName === "string" ? message.toolName : lookup.found ? lookup.entry.toolName : undefined;
  if (toolName === undefined) return;
  const text = extractText(Array.isArray(message.content) ? message.content : []);
  const failedTask = toolName === TASK_TOOL_NAME && taskResultFailed(message.details);
  const failedHarnessTool = isHarnessTool(toolName) && resultFailed(toolName, text);
  const isErrorResult = message.isError === true || failedTask || failedHarnessTool;
  const status: ActivityStatus = isErrorResult ? "error" : "success";
  activityStore.begin({
    id,
    toolName,
    args: lookup.found ? lookup.entry.args : {},
    cwd,
    startedAt: lookup.found ? lookup.entry.startedAt : startedAt,
  });
  activityStore.finish(id, { ...readToolResultFields(message.details), text, status, endedAt: startedAt });
}
