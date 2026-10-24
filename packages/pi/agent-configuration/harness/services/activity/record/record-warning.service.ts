import { WARNING_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { RecordNoticeInput } from "../../../types/activity/record/record-notice-input.interface.ts";

export function recordWarning(input: RecordNoticeInput): void {
  const { id, message, cwd, occurredAt } = input;
  activityStore.begin({ id, toolName: WARNING_ACTIVITY_NAME, args: {}, cwd, startedAt: occurredAt });
  activityStore.finish(id, { ...NO_TOOL_RESULT_FIELDS, text: message, status: "error", endedAt: occurredAt });
}
