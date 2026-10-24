import type { AgentActivityPhase } from "../../../types/activity/store/agent-activity-phase.interface.ts";

export function isAgentWorking(phase: AgentActivityPhase): boolean {
  return phase === "thinking" || phase === "working" || phase === "responding";
}
