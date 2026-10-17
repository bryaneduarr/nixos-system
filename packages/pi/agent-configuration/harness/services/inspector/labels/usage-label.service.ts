import { EMPTY_VALUE_LABEL } from "../../../constants/inspector/label.constant.ts";
import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { ToolActivityUsage } from "../../../types/activity/tool-activity-usage.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { contextLimitLabel } from "./context-limit-label.service.ts";
import { contextPercentLabel } from "./context-percent-label.service.ts";
import { formatTokens } from "./format-tokens.service.ts";
import { readPeakTokens } from "./read-peak-tokens.service.ts";

export function usageLabel(usage: ToolActivityUsage, model: ValueState<SubagentModel>): string {
  if (usage.usageState === "unreported") return `spent ${EMPTY_VALUE_LABEL} · max ctx ${EMPTY_VALUE_LABEL}`;
  const peak = readPeakTokens(usage.usage);
  const peakLabel = peak.state === "present" ? formatTokens(peak.value) : EMPTY_VALUE_LABEL;
  return `spent ${formatTokens(usage.usage.totalTokens)} · max ctx ${peakLabel}${contextLimitLabel(model)}${contextPercentLabel(peak, model)}`;
}
