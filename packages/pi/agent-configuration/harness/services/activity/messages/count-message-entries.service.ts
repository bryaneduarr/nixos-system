import { MESSAGE_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";

export function countMessageEntries(): number {
  return activityStore.all().filter((entry) => entry.toolName === MESSAGE_ACTIVITY_NAME).length;
}
