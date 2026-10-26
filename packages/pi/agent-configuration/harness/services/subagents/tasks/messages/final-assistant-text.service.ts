import type { AgentSession } from "@earendil-works/pi-coding-agent";
import { isAssistantMessage } from "./is-assistant-message.service.ts";
import { textContent } from "./text-content.service.ts";

export function finalAssistantText(messages: AgentSession["messages"]): string {
  return messages
    .filter(isAssistantMessage)
    .map((message) => textContent(message.content).trim())
    .reduce((lastText, text) => (text === "" ? lastText : text), "");
}
