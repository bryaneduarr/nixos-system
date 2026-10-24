import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { ACTIVITY_COMPLETION_ENTRY } from "../../../constants/activity/events/activity-keys.constant.ts";
import { activitySummaryState } from "../../../stores/activity/activity-summary-state.store.ts";
import type { CompletionEntryData } from "../../../types/activity/hydrate/completion-entry-data.interface.ts";
import { isRecord } from "../../values/is-record.service.ts";
import { readAssistantActivity } from "../parsing/assistant/read-assistant-activity.service.ts";
import { parseTimestamp } from "./parse-timestamp.service.ts";

export function restoreCompletions(ctx: ExtensionContext): void {
  let messageNumber = 0;
  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type === "message") {
      if (entry.message.role === "user") {
        messageNumber++;
        continue;
      }
      const isStoppedAssistant = entry.message.role === "assistant" && entry.message.stopReason === "stop";
      const isCompletedTurn = isStoppedAssistant && messageNumber > 0 && isFinalAnswer(entry.message);
      if (isCompletedTurn) {
        activitySummaryState.setCompletion(messageNumber, parseTimestamp(entry.timestamp));
      }
      continue;
    }
    const isCompletionEntry = entry.type === "custom" && entry.customType === ACTIVITY_COMPLETION_ENTRY;
    if (isCompletionEntry && isCompletionData(entry.data)) {
      activitySummaryState.setCompletion(entry.data.messageNumber, entry.data.completedAt);
    }
  }
}

function isFinalAnswer(message: unknown): boolean {
  const assistantActivity = readAssistantActivity(message);
  if (!assistantActivity.found) return false;
  const hasResponseText = assistantActivity.snapshot.response.trim() !== "";
  return !assistantActivity.snapshot.hasToolCall && hasResponseText;
}

function isCompletionData(data: unknown): data is CompletionEntryData {
  if (!isRecord(data)) return false;
  const hasMessageNumber = typeof data.messageNumber === "number";
  const hasCompletedAt = typeof data.completedAt === "number" && Number.isFinite(data.completedAt);
  return hasMessageNumber && hasCompletedAt;
}
