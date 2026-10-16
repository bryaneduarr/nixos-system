import { STOPPED_TASK_LABEL } from "../../../constants/subagents/progress.constant.ts";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles.constant.ts";
import type { TaskInput } from "../../../types/subagents/tasks/task-input.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/task-progress.interface.ts";
import type { TaskProgressLookup } from "../../../types/subagents/tasks/task-progress-lookup.interface.ts";

export function createFailedTaskProgress(
  lookup: TaskProgressLookup,
  handleId: string,
  params: TaskInput,
): TaskProgress {
  const known = lookup.found ? lookup.progress : undefined;

  return {
    id: known?.id ?? handleId,
    title: params.title,
    role: known?.role ?? params.role ?? TASK_TOOL_NAME,
    tools: known?.tools ?? params.tools ?? [],
    verificationCommands: known?.verificationCommands ?? params.verificationCommands ?? [],
    currentTask: STOPPED_TASK_LABEL,
    status: "error",
    model: known?.model ?? { state: "absent" },
    thinkingLevel: known?.thinkingLevel ?? { state: "absent" },
    activity: known?.activity ?? [],
    usage: known?.usage ?? { usageState: "unreported" },
  };
}
