import { API_ERROR_ACTIVITY_NAME } from "../../../constants/activity/activity-entry.constant.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";

export function isRecordedApiErrorText(markdown: string): boolean {
  const text = markdown.trim();
  return activityStore.all().some((entry) => entry.toolName === API_ERROR_ACTIVITY_NAME && entry.text.trim() === text);
}
