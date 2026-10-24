import { activityStore } from "../../../stores/activity/activity.store.ts";

export function recordedNames(): string[] {
  return activityStore.all().map((entry) => entry.toolName);
}
