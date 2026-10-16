import { MESSAGE_ACTIVITY_NAME } from "../../../constants/activity/activity-entry.constant.ts";
import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/no-tool-result-fields.constant.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";
import { countMessageEntries } from "./count-message-entries.service.ts";
import { readUserMessageText } from "./read-user-message-text.service.ts";

export function recordUserMessage(id: string, content: unknown, cwd: string, startedAt: number): void {
  const messageNumber = countMessageEntries() + 1;
  activityStore.begin({ id, toolName: MESSAGE_ACTIVITY_NAME, args: { number: messageNumber }, cwd, startedAt });
  activityStore.finish(id, {
    ...NO_TOOL_RESULT_FIELDS,
    text: readUserMessageText(content),
    status: "success",
    endedAt: startedAt,
  });
}
