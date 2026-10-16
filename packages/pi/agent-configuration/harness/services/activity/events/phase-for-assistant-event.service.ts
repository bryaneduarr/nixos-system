import type { AgentActivityPhase } from "../../../types/activity/agent-activity.interface.ts";

export function phaseForAssistantEvent(eventType: string, hasToolCall: boolean): AgentActivityPhase {
  if (eventType === "start" || eventType.startsWith("thinking")) return "thinking";
  if (eventType.startsWith("toolcall") || hasToolCall) return "working";
  return "responding";
}
