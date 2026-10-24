import { MESSAGE_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import { isMessageEntry } from "./is-message-entry.service.ts";

export function readMessageEntries(messageNumber: number): readonly ToolActivity[] {
  const entries = activityStore.all();
  const messageIndex = entries.findIndex((entry) => isMessageEntry(entry, messageNumber));
  if (messageIndex < 0) return [];
  const nextMessageIndex = entries.findIndex(
    (entry, index) => index > messageIndex && entry.toolName === MESSAGE_ACTIVITY_NAME,
  );
  return entries.slice(messageIndex + 1, nextMessageIndex < 0 ? undefined : nextMessageIndex);
}
