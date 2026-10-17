import { STARTING_TASK_LABEL } from "../../../constants/subagents/progress.constant.ts";
import type { ResolvedTaskRole } from "../../../types/subagents/roles/resolved-task-role.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/task-progress.interface.ts";

export function createTaskProgress(id: string, title: string, resolvedRole: ResolvedTaskRole): TaskProgress {
  return {
    id,
    title,
    role: resolvedRole.role,
    tools: [...resolvedRole.tools],
    verificationCommands: [...resolvedRole.verificationCommands],
    currentTask: STARTING_TASK_LABEL,
    status: "running",
    model: { state: "absent" },
    thinkingLevel: { state: "absent" },
    activity: [],
    usage: { usageState: "unreported" },
  };
}
