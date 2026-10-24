import { REPLY_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { RecordTurnPartInput } from "../../../types/activity/record/record-turn-part-input.interface.ts";

export function recordReply(input: RecordTurnPartInput, text: string): void {
  const { id, cwd, startedAt, endedAt } = input;
  activityStore.begin({ id, toolName: REPLY_ACTIVITY_NAME, args: {}, cwd, startedAt });
  activityStore.finish(id, { ...NO_TOOL_RESULT_FIELDS, text, status: "success", endedAt });
}
