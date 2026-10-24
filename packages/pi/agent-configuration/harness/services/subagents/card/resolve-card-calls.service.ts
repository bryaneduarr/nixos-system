import type { SubToolActivity } from "../../../types/activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { ToolActivityLookup } from "../../../types/activity/store/tool-activity-lookup.interface.ts";
import type { TaskProgressLookup } from "../../../types/subagents/tasks/progress/task-progress-lookup.interface.ts";

export function resolveCardCalls(
  progressLookup: TaskProgressLookup,
  activityLookup: ToolActivityLookup,
): readonly SubToolActivity[] {
  if (progressLookup.found) return progressLookup.progress.activity;
  if (activityLookup.found) return activityLookup.entry.sub;

  return [];
}
