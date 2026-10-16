import { STOPPED_TASK_LABEL } from "../../../constants/subagents/progress.constant.ts";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles.constant.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/task-progress.interface.ts";
import type { TaskProgressLookup } from "../../../types/subagents/tasks/task-progress-lookup.interface.ts";
import type { TaskRequest } from "../../../types/subagents/tasks/task-request.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

export function createFailedTaskProgress(
  lookup: TaskProgressLookup,
  handleId: string,
  request: TaskRequest,
): TaskProgress {
  if (lookup.found) {
    return { ...lookup.progress, currentTask: STOPPED_TASK_LABEL, status: "error" };
  }

  return {
    id: handleId,
    title: request.title,
    role: presentValue(request.role) ?? TASK_TOOL_NAME,
    tools: [...(presentValue(request.tools) ?? [])],
    verificationCommands: [...(presentValue(request.verificationCommands) ?? [])],
    currentTask: STOPPED_TASK_LABEL,
    status: "error",
    model: { state: "absent" },
    thinkingLevel: { state: "absent" },
    activity: [],
    usage: { usageState: "unreported" },
  };
}
