import { API_ERROR_ACTIVITY_NAME } from "../../../constants/activity/activity-entry.constant.ts";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";

export function recordApiError(id: string, errorMessage: string, cwd: string, occurredAt: number): void {
  activityStore.begin({ id, toolName: API_ERROR_ACTIVITY_NAME, args: {}, cwd, startedAt: occurredAt });
  activityStore.finish(id, { ...NO_TOOL_RESULT_FIELDS, text: errorMessage, status: "error", endedAt: occurredAt });
}
