import type { AssistantActivityLookup } from "../../../../types/activity/parsing/assistant/assistant-activity-lookup.interface.ts";
import { isRecord } from "../../../values/is-record.service.ts";

export function readAssistantActivity(message: unknown): AssistantActivityLookup {
  if (!isRecord(message) || message.role !== "assistant" || !Array.isArray(message.content)) {
    return { found: false };
  }
  const parts = message.content.filter(isRecord).filter((part) => typeof part.type === "string");
  const thinkingParts = parts.filter((part) => part.type === "thinking");
  return {
    found: true,
    snapshot: {
      thinking: thinkingParts.map((part) => (typeof part.thinking === "string" ? part.thinking : "")).join(""),
      thinkingRedacted: thinkingParts.some((part) => part.redacted === true),
      response: parts
        .flatMap((part) => (part.type === "text" && typeof part.text === "string" ? [part.text] : []))
        .join(""),
      hasToolCall: parts.some((part) => part.type === "toolCall"),
    },
  };
}
