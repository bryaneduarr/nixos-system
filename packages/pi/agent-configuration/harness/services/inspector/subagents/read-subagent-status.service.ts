import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import type { TaskStatus } from "../../../types/subagents/tasks/progress/task-status.interface.ts";

export function readSubagentStatus(entry: ToolActivity): TaskStatus {
  if (entry.status === "running") return "running";
  if (entry.details.state === "absent" || entry.details.value.status === "running") return entry.status;
  return entry.details.value.status;
}
