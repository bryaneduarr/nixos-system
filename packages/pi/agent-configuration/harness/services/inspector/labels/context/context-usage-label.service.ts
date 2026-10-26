import { EMPTY_VALUE_LABEL } from "../../../../constants/inspector/detail/label.constant.ts";
import type { SubagentModel } from "../../../../types/activity/parsing/subagent/subagent-model.interface.ts";
import type { ToolActivityUsage } from "../../../../types/activity/parsing/subagent/tool-activity-usage.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import { formatTokens } from "../../format/format-tokens.service.ts";
import { contextPercentLabel } from "./context-percent-label.service.ts";
import { readContextLimit } from "./read-context-limit.service.ts";

function readUsageContextTokens(usage: ToolActivityUsage): ValueState<number> {
  return usage.usageState === "reported" ? usage.usage.contextTokens : { state: "absent" };
}

export function contextUsageLabel(usage: ToolActivityUsage, model: ValueState<SubagentModel>): string {
  const used = readUsageContextTokens(usage);
  const limit = readContextLimit(model);
  const usedLabel = used.state === "present" ? formatTokens(used.value) : EMPTY_VALUE_LABEL;
  const limitLabel = limit.state === "present" ? formatTokens(limit.value) : EMPTY_VALUE_LABEL;
  return `${usedLabel}/${limitLabel}${contextPercentLabel(used, model)}`;
}
