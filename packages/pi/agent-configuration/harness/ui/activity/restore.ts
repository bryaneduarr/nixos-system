import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { readAssistantActivity } from "../../activity/parse.ts";
import { safeParseTimestamp } from "./records.ts";
import { ACTIVITY_COMPLETION_ENTRY, setActivityCompletion } from "./summary-state.ts";

export function restoreCompletions(ctx: ExtensionContext): void {
  let messageNumber = 0;
  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type === "message") {
      if (entry.message.role === "user") {
        messageNumber++;
      } else if (entry.message.role === "assistant" && entry.message.stopReason === "stop" && messageNumber > 0) {
        const trace = readAssistantActivity(entry.message);
        if (trace && !trace.hasToolCall && trace.response.trim()) {
          setActivityCompletion(messageNumber, safeParseTimestamp(entry.timestamp));
        }
      }
      continue;
    }
    if (entry.type !== "custom" || entry.customType !== ACTIVITY_COMPLETION_ENTRY) continue;
    const data = entry.data;
    if (
      typeof data === "object" &&
      data !== null &&
      "messageNumber" in data &&
      "completedAt" in data &&
      typeof data.messageNumber === "number" &&
      typeof data.completedAt === "number" &&
      Number.isFinite(data.completedAt)
    ) {
      setActivityCompletion(data.messageNumber, data.completedAt);
    }
  }
}
