import { activityStore } from "../../activity/store.ts";
import { MESSAGE_ACTIVITY_NAME } from "../../constants/activity/activity-entry.constant.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles.constant.ts";
import { isHarnessTool } from "../../tools/config.ts";
import type { ActivityStatus } from "../../types/activity/activity-status.interface.ts";
import type { ActivityActionSummary } from "../../types/activity/activity-summary.interface.ts";
import type { ToolActivity } from "../../types/activity/tool-activity.interface.ts";

const completions = new Map<number, number>();
let working = false;
let frame = 0;

export function clearActivityCompletions(): void {
  completions.clear();
}

export function setActivitySummaryState(isWorking: boolean, nextFrame: number): void {
  working = isWorking;
  frame = nextFrame;
}

export function setActivityCompletion(messageNumber: number, completedAt: number): void {
  completions.set(messageNumber, completedAt);
}

export function clearActivityCompletion(messageNumber: number): void {
  completions.delete(messageNumber);
}

export function activitySummaryState() {
  return { working, frame, completions };
}

export function summarizeActivity(entries: readonly ToolActivity[]): ActivityActionSummary[] {
  return entries.flatMap((entry) => {
    const isTaskTool = entry.toolName === TASK_TOOL_NAME;
    if (!isTaskTool && !isHarnessTool(entry.toolName)) return [];

    return [{ status: entry.status }];
  });
}

export function actionsForMessage(messageNumber: number): ActivityActionSummary[] {
  const entries = activityStore.all();
  const start = entries.findIndex(
    (entry) => entry.toolName === MESSAGE_ACTIVITY_NAME && entry.args.number === messageNumber,
  );
  if (start < 0) return [];

  const next = entries.findIndex((entry, index) => index > start && entry.toolName === MESSAGE_ACTIVITY_NAME);
  const end = next < 0 ? undefined : next;
  return summarizeActivity(entries.slice(start + 1, end));
}
