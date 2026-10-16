import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { SubagentUsage } from "../../../types/activity/subagent-usage.interface.ts";
import { contextLimitLabel } from "./context-limit-label.service.ts";
import { formatTokens } from "./format-tokens.service.ts";
import { readPeakTokens } from "./read-peak-tokens.service.ts";

export function compactUsageLabel(usage: SubagentUsage | undefined, model: SubagentModel | undefined): string {
  if (!usage) return "spent — · peak —";
  const peak = readPeakTokens(usage);
  return `spent ${formatTokens(usage.totalTokens)} · peak ${peak === undefined ? "—" : formatTokens(peak)}${contextLimitLabel(model)}`;
}
