import { MESSAGE_ACTIVITY_NAME } from "../../../constants/activity/record/activity-entry.constant.ts";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { RecordUserMessageInput } from "../../../types/activity/record/record-user-message-input.interface.ts";
import { countMessageEntries } from "../messages/count-message-entries.service.ts";
import { readUserMessageText } from "../parsing/assistant/read-user-message-text.service.ts";

export function recordUserMessage(input: RecordUserMessageInput): void {
  const { id, content, cwd, startedAt } = input;
  const messageNumber = countMessageEntries() + 1;
  activityStore.begin({ id, toolName: MESSAGE_ACTIVITY_NAME, args: { number: messageNumber }, cwd, startedAt });
  activityStore.finish(id, {
    ...NO_TOOL_RESULT_FIELDS,
    text: readUserMessageText(content),
    status: "success",
    endedAt: startedAt,
  });
}
