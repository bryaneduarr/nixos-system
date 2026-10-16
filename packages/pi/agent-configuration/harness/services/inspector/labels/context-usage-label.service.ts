import type { SubagentModel } from "../../../types/activity/subagent-model.interface.ts";
import type { SubagentUsage } from "../../../types/activity/subagent-usage.interface.ts";
import { contextLimitLabel } from "./context-limit-label.service.ts";
import { contextPercentLabel } from "./context-percent-label.service.ts";
import { formatTokens } from "./format-tokens.service.ts";
import { readCurrentTokens } from "./read-current-tokens.service.ts";
import { readPeakTokens } from "./read-peak-tokens.service.ts";

export function contextUsageLabel(usage: SubagentUsage | undefined, model: SubagentModel | undefined): string {
  const current = usage === undefined ? undefined : readCurrentTokens(usage);
  const peak = usage === undefined ? undefined : readPeakTokens(usage);
  const limit = contextLimitLabel(model);
  return `now ${current === undefined ? "—" : formatTokens(current)}${limit}${contextPercentLabel(current, model)} · peak ${peak === undefined ? "—" : formatTokens(peak)}${limit}${contextPercentLabel(peak, model)}`;
}
