import { UPDATE_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { RecordTextEntryInput } from "../../../types/activity/record/record-text-entry-input.interface.ts";

export function recordUpdate(input: RecordTextEntryInput): void {
  const { id, text, cwd, startedAt } = input;
  if (!text.trim()) return;
  activityStore.begin({ id, toolName: UPDATE_ACTIVITY_NAME, args: {}, cwd, startedAt });
  activityStore.update(id, { ...NO_TOOL_RESULT_FIELDS, text, status: { state: "absent" } });
}
