import { isRecord } from "./is-record.service.ts";

export function isAssistantMessage(message: unknown): message is Record<string, unknown> {
  return isRecord(message) && message.role === "assistant";
}
