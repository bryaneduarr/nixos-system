import type { SubagentUsage } from "../../../../types/activity/parsing/subagent/subagent-usage.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";

export function readPeakTokens(usage: SubagentUsage): ValueState<number> {
  return usage.maxContextTokens.state === "present" ? usage.maxContextTokens : usage.contextTokens;
}
