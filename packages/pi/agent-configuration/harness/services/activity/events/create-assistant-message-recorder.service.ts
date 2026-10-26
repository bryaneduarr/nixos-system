import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { AssistantMessageRecorder } from "../../../types/activity/events/assistant-message-recorder.interface.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import { readApiError } from "../parsing/assistant/read-api-error.service.ts";
import { readAssistantActivity } from "../parsing/assistant/read-assistant-activity.service.ts";
import { readSubagentUsage } from "../parsing/subagent/read-subagent-usage.service.ts";
import { recordApiError } from "../record/record-api-error.service.ts";
import { recordAssistantTurn } from "../record/record-assistant-turn.service.ts";
import { recordThinking } from "../record/record-thinking.service.ts";
import { recordUpdate } from "../record/record-update.service.ts";

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
        recordThinking({ id: thinkingId.value, text: assistantActivity.snapshot.thinking, cwd, startedAt: Date.now() });
      if (updateId.state === "present" && assistantActivity.snapshot.hasToolCall)
        recordUpdate({ id: updateId.value, text: assistantActivity.snapshot.response, cwd, startedAt: Date.now() });
      return assistantActivity;
    },
    end(message, cwd) {
      const assistantActivity = readAssistantActivity(message);
      if (!assistantActivity.found) return assistantActivity;
      const { thinking, response, hasToolCall } = assistantActivity.snapshot;
      if (thinkingId.state === "present" && thinking) {
        recordThinking({ id: thinkingId.value, text: thinking, cwd, startedAt: Date.now() });
        activityStore.finish(thinkingId.value, {
          ...NO_TOOL_RESULT_FIELDS,
          text: thinking,
          status: "success",
          endedAt: Date.now(),
        });
      }
      thinkingId = { state: "absent" };
      if (updateId.state === "present" && hasToolCall && response.trim()) {
        recordUpdate({ id: updateId.value, text: response, cwd, startedAt: Date.now() });
        activityStore.finish(updateId.value, {
          ...NO_TOOL_RESULT_FIELDS,
          text: response,
          status: "success",
          endedAt: Date.now(),
        });
      }
      updateId = { state: "absent" };
      const apiError = readApiError(message);
      if (apiError.state === "present")
        recordApiError({ id: `api-error-live-${sequence}`, message: apiError.value, cwd, occurredAt: Date.now() });
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
