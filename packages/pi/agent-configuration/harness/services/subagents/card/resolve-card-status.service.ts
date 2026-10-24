import type { ToolActivityLookup } from "../../../types/activity/store/tool-activity-lookup.interface.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/progress/task-progress.interface.ts";
import type { TaskStatus } from "../../../types/subagents/tasks/progress/task-status.interface.ts";

export function resolveCardStatus(current: ValueState<TaskProgress>, activityLookup: ToolActivityLookup): TaskStatus {
  if (current.state === "present") return current.value.status;
  if (activityLookup.found) return activityLookup.entry.status;

  return "running";
}
