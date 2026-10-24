import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/no-tool-result-fields.constant.ts";
import type { AssistantMessageRecorder } from "../../../types/activity/assistant-message-recorder.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { recordApiError } from "../history/record-api-error.service.ts";
import { recordAssistantTurn } from "../history/record-assistant-turn.service.ts";
import { recordThinking } from "../history/record-thinking.service.ts";
import { recordUpdate } from "../history/record-update.service.ts";
import { readApiError } from "../parsing/read-api-error.service.ts";
import { readAssistantActivity } from "../parsing/read-assistant-activity.service.ts";
import { readSubagentUsage } from "../parsing/read-subagent-usage.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";

export function createAssistantMessageRecorder(): AssistantMessageRecorder {
  let thinkingId: ValueState<string> = { state: "absent" };
  let updateId: ValueState<string> = { state: "absent" };
  let messageStartedAt: ValueState<number> = { state: "absent" };
  let sequence = 0;

  return {
    reset() {
      thinkingId = { state: "absent" };
      updateId = { state: "absent" };
      messageStartedAt = { state: "absent" };
    },
    start(message) {
      if (!readAssistantActivity(message).found) return;
      sequence++;
      messageStartedAt = { state: "present", value: Date.now() };
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
      const apiError = readApiError(message);
      if (apiError.state === "present") recordApiError(`api-error-live-${sequence}`, apiError.value, cwd, Date.now());
      if (messageStartedAt.state === "present") {
        recordAssistantTurn({
          idSuffix: `live-${sequence}`,
          snapshot: assistantActivity.snapshot,
          usage: readSubagentUsage(message),
          hasApiError: apiError.state === "present",
          cwd,
          startedAt: messageStartedAt.value,
          endedAt: Date.now(),
        });
      }
      messageStartedAt = { state: "absent" };
      return assistantActivity;
    },
  };
}
