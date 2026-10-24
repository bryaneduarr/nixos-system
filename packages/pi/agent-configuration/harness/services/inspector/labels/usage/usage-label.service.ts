import { EMPTY_VALUE_LABEL } from "../../../../constants/inspector/detail/label.constant.ts";
import type { SubagentModel } from "../../../../types/activity/parsing/subagent/subagent-model.interface.ts";
import type { ToolActivityUsage } from "../../../../types/activity/parsing/subagent/tool-activity-usage.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import { formatTokens } from "../../format/format-tokens.service.ts";
import { contextLimitLabel } from "../context/context-limit-label.service.ts";
import { contextPercentLabel } from "../context/context-percent-label.service.ts";
import { readPeakTokens } from "./read-peak-tokens.service.ts";

export function usageLabel(usage: ToolActivityUsage, model: ValueState<SubagentModel>): string {
  if (usage.usageState === "unreported") return `spent ${EMPTY_VALUE_LABEL}  max ctx ${EMPTY_VALUE_LABEL}`;
  const peak = readPeakTokens(usage.usage);
  const peakLabel = peak.state === "present" ? formatTokens(peak.value) : EMPTY_VALUE_LABEL;
  return `spent ${formatTokens(usage.usage.totalTokens)}  max ctx ${peakLabel}${contextLimitLabel(model)}${contextPercentLabel(peak, model)}`;
}
