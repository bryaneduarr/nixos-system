import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { SubagentUsage } from "../../../types/activity/subagent-usage.interface.ts";
import { contextLimitLabel } from "./context-limit-label.service.ts";
import { contextPercentLabel } from "./context-percent-label.service.ts";
import { formatTokens } from "./format-tokens.service.ts";
import { readPeakTokens } from "./read-peak-tokens.service.ts";

export function usageLabel(usage: SubagentUsage | undefined, model: SubagentModel | undefined): string {
  if (!usage) return "spent — · max ctx —";
  const peak = readPeakTokens(usage);
  const peakLabel = peak === undefined ? "—" : formatTokens(peak);
  return `spent ${formatTokens(usage.totalTokens)} · max ctx ${peakLabel}${contextLimitLabel(model)}${contextPercentLabel(peak, model)}`;
}
