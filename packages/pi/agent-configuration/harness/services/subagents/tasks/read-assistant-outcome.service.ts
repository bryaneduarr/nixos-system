import type { AssistantOutcome } from "../../../types/subagents/tasks/assistant-outcome.interface.ts";
import { toValueState } from "../../activity/value/to-value-state.service.ts";
import { isAssistantMessage } from "./is-assistant-message.service.ts";

function stringField(message: Record<string, unknown> | undefined, field: string): string | undefined {
  const value = message?.[field];
  return typeof value === "string" ? value : undefined;
}

export function readAssistantOutcome(messages: readonly unknown[]): AssistantOutcome {
  const lastAssistantMessage = messages.filter(isAssistantMessage).at(-1);

  return {
    stopReason: toValueState(stringField(lastAssistantMessage, "stopReason")),
    errorMessage: toValueState(stringField(lastAssistantMessage, "errorMessage")),
  };
}
