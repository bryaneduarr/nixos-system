import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/no-tool-result-fields.constant.ts";
import type { AssistantMessageRecorder } from "../../../types/activity/assistant-message-recorder.interface.ts";
import { recordThinking } from "../history/record-thinking.service.ts";
import { recordUpdate } from "../history/record-update.service.ts";
import { readAssistantActivity } from "../parsing/read-assistant-activity.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";

export function createAssistantMessageRecorder(): AssistantMessageRecorder {
  let thinkingId: string | undefined;
  let updateId: string | undefined;
  let sequence = 0;

  return {
    reset() {
      thinkingId = undefined;
      updateId = undefined;
    },
    start(message) {
      if (!readAssistantActivity(message).found) return;
      sequence++;
      thinkingId = `thinking-live-${sequence}`;
      updateId = `update-live-${sequence}`;
    },
    update(message, cwd) {
      const trace = readAssistantActivity(message);
      if (!trace.found) return trace;
      if (thinkingId) recordThinking(thinkingId, trace.snapshot.thinking, cwd, Date.now());
      if (updateId && trace.snapshot.hasToolCall) recordUpdate(updateId, trace.snapshot.response, cwd, Date.now());
      return trace;
    },
    end(message, cwd) {
      const trace = readAssistantActivity(message);
      if (!trace.found) return trace;
      const { thinking, response, hasToolCall } = trace.snapshot;
      if (thinkingId && thinking) {
        recordThinking(thinkingId, thinking, cwd, Date.now());
        activityStore.finish(thinkingId, {
          ...NO_TOOL_RESULT_FIELDS,
          text: thinking,
          status: "success",
          endedAt: Date.now(),
        });
      }
      thinkingId = undefined;
      if (updateId && hasToolCall && response.trim()) {
        recordUpdate(updateId, response, cwd, Date.now());
        activityStore.finish(updateId, {
          ...NO_TOOL_RESULT_FIELDS,
          text: response,
          status: "success",
          endedAt: Date.now(),
        });
      }
      updateId = undefined;
      return trace;
    },
  };
}
