import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/no-tool-result-fields.constant.ts";
import type { AssistantMessageRecorder } from "../../../types/activity/assistant-message-recorder.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { recordThinking } from "../history/record-thinking.service.ts";
import { recordUpdate } from "../history/record-update.service.ts";
import { readAssistantActivity } from "../parsing/read-assistant-activity.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";

export function createAssistantMessageRecorder(): AssistantMessageRecorder {
  let thinkingId: ValueState<string> = { state: "absent" };
  let updateId: ValueState<string> = { state: "absent" };
  let sequence = 0;

  return {
    reset() {
      thinkingId = { state: "absent" };
      updateId = { state: "absent" };
    },
    start(message) {
      if (!readAssistantActivity(message).found) return;
      sequence++;
      thinkingId = { state: "present", value: `thinking-live-${sequence}` };
      updateId = { state: "present", value: `update-live-${sequence}` };
    },
    update(message, cwd) {
      const assistantActivity = readAssistantActivity(message);
      if (!assistantActivity.found) return assistantActivity;
      if (thinkingId.state === "present")
        recordThinking(thinkingId.value, assistantActivity.snapshot.thinking, cwd, Date.now());
      if (updateId.state === "present" && assistantActivity.snapshot.hasToolCall)
        recordUpdate(updateId.value, assistantActivity.snapshot.response, cwd, Date.now());
      return assistantActivity;
    },
    end(message, cwd) {
      const assistantActivity = readAssistantActivity(message);
      if (!assistantActivity.found) return assistantActivity;
      const { thinking, response, hasToolCall } = assistantActivity.snapshot;
      if (thinkingId.state === "present" && thinking) {
        recordThinking(thinkingId.value, thinking, cwd, Date.now());
        activityStore.finish(thinkingId.value, {
          ...NO_TOOL_RESULT_FIELDS,
          text: thinking,
          status: "success",
          endedAt: Date.now(),
        });
      }
      thinkingId = { state: "absent" };
      if (updateId.state === "present" && hasToolCall && response.trim()) {
        recordUpdate(updateId.value, response, cwd, Date.now());
        activityStore.finish(updateId.value, {
          ...NO_TOOL_RESULT_FIELDS,
          text: response,
          status: "success",
          endedAt: Date.now(),
        });
      }
      updateId = { state: "absent" };
      return assistantActivity;
    },
  };
}
