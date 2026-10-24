import type { ToolActivityLookup } from "../../../types/activity/store/tool-activity-lookup.interface.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/progress/task-progress.interface.ts";
import type { TaskProgressLookup } from "../../../types/subagents/tasks/progress/task-progress-lookup.interface.ts";

export function resolveCardProgress(
  progressLookup: TaskProgressLookup,
  activityLookup: ToolActivityLookup,
): ValueState<TaskProgress> {
  if (progressLookup.found) return { state: "present", value: progressLookup.progress };
  if (activityLookup.found) return activityLookup.entry.details;

  return { state: "absent" };
}
