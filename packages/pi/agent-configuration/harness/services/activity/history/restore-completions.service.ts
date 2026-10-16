import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { ACTIVITY_COMPLETION_ENTRY } from "../../../constants/activity/activity-keys.constant.ts";
import { isRecord } from "../parsing/is-record.service.ts";
import { readAssistantActivity } from "../parsing/read-assistant-activity.service.ts";
import { activitySummaryState } from "../summary/shared-activity-summary-state.service.ts";
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
      if (isStoppedAssistant && messageNumber > 0 && isFinalAnswer(entry.message)) {
        activitySummaryState.setCompletion(messageNumber, parseTimestamp(entry.timestamp));
      }
      continue;
    }
    if (entry.type === "custom" && entry.customType === ACTIVITY_COMPLETION_ENTRY && isCompletionData(entry.data)) {
      activitySummaryState.setCompletion(entry.data.messageNumber, entry.data.completedAt);
    }
  }
}

function isFinalAnswer(message: unknown): boolean {
  const trace = readAssistantActivity(message);
  return trace.found && !trace.snapshot.hasToolCall && trace.snapshot.response.trim() !== "";
}

function isCompletionData(data: unknown): data is { readonly messageNumber: number; readonly completedAt: number } {
  if (!isRecord(data)) return false;
  const hasMessageNumber = typeof data.messageNumber === "number";
  const hasCompletedAt = typeof data.completedAt === "number" && Number.isFinite(data.completedAt);
  return hasMessageNumber && hasCompletedAt;
}
