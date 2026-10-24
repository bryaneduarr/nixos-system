import { UPDATE_ACTIVITY_NAME } from "../../../constants/activity/activity-entry.constant.ts";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/no-tool-result-fields.constant.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";

export function recordUpdate(id: string, text: string, cwd: string, startedAt: number): void {
  if (!text.trim()) return;
  activityStore.begin({ id, toolName: UPDATE_ACTIVITY_NAME, args: {}, cwd, startedAt });
  activityStore.update(id, { ...NO_TOOL_RESULT_FIELDS, text, status: { state: "absent" } });
}
