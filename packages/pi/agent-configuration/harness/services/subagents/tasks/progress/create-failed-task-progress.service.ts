import { TASK_TOOL_NAME } from "../../../../constants/subagents/roles/roles.constant.ts";
import { STOPPED_TASK_LABEL } from "../../../../constants/subagents/tasks/progress/progress.constant.ts";
import type { TaskProgress } from "../../../../types/subagents/tasks/progress/task-progress.interface.ts";
import type { TaskProgressLookup } from "../../../../types/subagents/tasks/progress/task-progress-lookup.interface.ts";
import type { TaskRequest } from "../../../../types/subagents/tasks/run/task-request.interface.ts";

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
    role: request.role.state === "present" ? request.role.value : TASK_TOOL_NAME,
    tools: [...(request.tools.state === "present" ? request.tools.value : [])],
    verificationCommands: [
      ...(request.verificationCommands.state === "present" ? request.verificationCommands.value : []),
    ],
    currentTask: STOPPED_TASK_LABEL,
    status: "error",
    model: { state: "absent" },
    thinkingLevel: { state: "absent" },
    activity: [],
    usage: { usageState: "unreported" },
  };
}
