import type { AgentSession } from "@earendil-works/pi-coding-agent";
import type { AssistantOutcome } from "../../../../types/subagents/tasks/messages/assistant-outcome.interface.ts";
import { toValueState } from "../../../activity/value/to-value-state.service.ts";
import { isAssistantMessage } from "./is-assistant-message.service.ts";

export function readAssistantOutcome(messages: AgentSession["messages"]): AssistantOutcome {
  const lastAssistantMessage = messages.filter(isAssistantMessage).at(-1);
  if (!lastAssistantMessage) {
    return { stopReason: { state: "absent" }, errorMessage: { state: "absent" } };
  }

  return {
    stopReason: { state: "present", value: lastAssistantMessage.stopReason },
    errorMessage: toValueState(lastAssistantMessage.errorMessage),
  };
}
