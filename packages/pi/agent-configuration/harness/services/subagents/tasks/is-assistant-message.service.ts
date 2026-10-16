import type { AgentMessage } from "@earendil-works/pi-agent-core";
import type { AssistantMessage } from "@earendil-works/pi-ai";

export function isAssistantMessage(message: AgentMessage): message is AssistantMessage {
  return message.role === "assistant";
}
