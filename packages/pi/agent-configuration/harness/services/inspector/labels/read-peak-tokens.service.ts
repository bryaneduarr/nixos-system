import type { SubagentUsage } from "../../../types/activity/subagent-usage.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";

export function readPeakTokens(usage: SubagentUsage): ValueState<number> {
  return usage.maxContextTokens.state === "present" ? usage.maxContextTokens : usage.contextTokens;
}
