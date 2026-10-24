import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import { isMessageEntry } from "./is-message-entry.service.ts";

export function readMessageStartedAt(messageNumber: number): ValueState<number> {
  const messageEntry = activityStore.all().find((entry) => isMessageEntry(entry, messageNumber));
  return messageEntry === undefined ? { state: "absent" } : { state: "present", value: messageEntry.startedAt };
}
