import { isAssistantMessage } from "./is-assistant-message.service.ts";
import { textContent } from "./text-content.service.ts";

export function finalAssistantText(messages: readonly unknown[]): string {
  return (
    messages
      .filter(isAssistantMessage)
      .map((message) => textContent(message.content).trim())
      .findLast((text) => text !== "") ?? ""
  );
}
