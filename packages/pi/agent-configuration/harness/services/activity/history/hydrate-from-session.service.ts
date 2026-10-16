import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isRecord } from "../parsing/is-record.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";
import { hydrateAssistantMessage } from "./hydrate-assistant-message.service.ts";
import { hydrateToolResult } from "./hydrate-tool-result.service.ts";
import { parseTimestamp } from "./parse-timestamp.service.ts";
import { recordUserMessage } from "./record-user-message.service.ts";

export function hydrateFromSession(ctx: ExtensionContext): void {
  activityStore.clear();
  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "message" || !isRecord(entry.message)) continue;
    const startedAt = parseTimestamp(entry.timestamp);
    const message: Readonly<Record<string, unknown>> = entry.message;
    if (message.role === "user") {
      recordUserMessage(`message-${entry.id}`, message.content, ctx.cwd, startedAt);
    } else if (message.role === "assistant" && Array.isArray(message.content)) {
      hydrateAssistantMessage({ entryId: entry.id, message, cwd: ctx.cwd, startedAt });
    } else if (message.role === "toolResult" && typeof message.toolCallId === "string") {
      hydrateToolResult({ id: message.toolCallId, message, cwd: ctx.cwd, startedAt });
    }
  }
}
