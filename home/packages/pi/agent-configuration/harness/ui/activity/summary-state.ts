import { activityStore, type ActivityStatus, type ToolActivity } from "../../activity/store.ts";
import { isHarnessTool } from "../../tools/config.ts";

export const ACTIVITY_SUMMARY_ENTRY = "harness-activity-summary";
export const ACTIVITY_WIDGET_KEY = "harness-activity";
export const ACTIVITY_COMPLETION_ENTRY = "harness-activity-completion";

const completions = new Map<number, number>();
let working = false;
let frame = 0;

export function clearActivityCompletions(): void { completions.clear(); }
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

export interface ActivityActionSummary { status: ActivityStatus; }
export interface ActivitySummaryData { messageNumber: number; }

export function summarizeActivity(entries: readonly ToolActivity[]): ActivityActionSummary[] {
  return entries.flatMap((entry) => isHarnessTool(entry.toolName) ? [{ status: entry.status }] : []);
}

export function actionsForMessage(messageNumber: number): ActivityActionSummary[] {
  const entries = activityStore.all();
  const start = entries.findIndex(
    (entry) => entry.toolName === "message" && entry.args.number === messageNumber,
  );
  if (start < 0) return [];
  const next = entries.findIndex((entry, index) => index > start && entry.toolName === "message");
  return summarizeActivity(entries.slice(start + 1, next < 0 ? undefined : next));
}
