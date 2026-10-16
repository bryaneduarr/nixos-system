import { MESSAGE_ACTIVITY_NAME } from "../../../constants/activity/activity-entry.constant.ts";
import type { ToolActivity } from "../../../types/activity/tool-activity.interface.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";

export function readMessageEntries(messageNumber: number): readonly ToolActivity[] {
  const entries = activityStore.all();
  const start = entries.findIndex(
    (entry) => entry.toolName === MESSAGE_ACTIVITY_NAME && entry.args.number === messageNumber,
  );
  if (start < 0) return [];
  const next = entries.findIndex((entry, index) => index > start && entry.toolName === MESSAGE_ACTIVITY_NAME);
  return entries.slice(start + 1, next < 0 ? undefined : next);
}
