import { presentValue } from "../../services/activity/value/present-value.service.ts";
import type { SubagentModel } from "../../types/activity/subagent-model.interface.ts";
import type { SubagentUsage } from "../../types/activity/subagent-usage.interface.ts";
import type { ToolActivityUsage } from "../../types/activity/tool-activity-usage.interface.ts";

function formatTokens(tokens: number): string {
  if (tokens < 1000) return `${tokens}`;
  if (tokens < 1_000_000) {
    return `${(tokens / 1000).toFixed(tokens < 10_000 ? 1 : 0)}k`;
  }
  return `${(tokens / 1_000_000).toFixed(1)}m`;
}

function contextLimit(model: SubagentModel | undefined): number | undefined {
  const window = model === undefined ? undefined : presentValue(model.contextWindow);
  return window !== undefined && window > 0 ? window : undefined;
}

function contextLimitLabel(model: SubagentModel | undefined): string {
  const limit = contextLimit(model);
  return limit === undefined ? "" : `/${formatTokens(limit)}`;
}

function contextPercentLabel(tokens: number | undefined, model: SubagentModel | undefined): string {
  const limit = contextLimit(model);
  if (tokens === undefined || limit === undefined) {
    return "";
  }
  const percent = (tokens / limit) * 100;
  return ` (${percent < 10 ? percent.toFixed(1) : Math.round(percent)}%)`;
}

function currentTokens(usage: SubagentUsage): number | undefined {
  return presentValue(usage.contextTokens);
}

function peakTokens(usage: SubagentUsage): number | undefined {
  return presentValue(usage.maxContextTokens) ?? currentTokens(usage);
}

export function reportedUsageOf(usage: ToolActivityUsage): SubagentUsage | undefined {
  return usage.usageState === "reported" ? usage.usage : undefined;
}

export function modelLabel(model: SubagentModel | undefined): string {
  if (!model) return "model —";
  const qualified = `${model.provider}/${model.id}`;
  const name = presentValue(model.name);
  return name && name !== model.id ? `${name} (${qualified})` : qualified;
}

export function modelShortLabel(model: SubagentModel | undefined): string {
  if (!model) return "model —";
  return presentValue(model.name) ?? model.id;
}

export function usageLabel(usage: SubagentUsage | undefined, model: SubagentModel | undefined): string {
  if (!usage) return "spent — · max ctx —";
  const peak = peakTokens(usage);
  const peakLabel = peak === undefined ? "—" : formatTokens(peak);
  return `spent ${formatTokens(usage.totalTokens)} · max ctx ${peakLabel}${contextLimitLabel(model)}${contextPercentLabel(peak, model)}`;
}

export function compactUsageLabel(usage: SubagentUsage | undefined, model: SubagentModel | undefined): string {
  if (!usage) return "spent — · peak —";
  const peak = peakTokens(usage);
  return `spent ${formatTokens(usage.totalTokens)} · peak ${peak === undefined ? "—" : formatTokens(peak)}${contextLimitLabel(model)}`;
}

export function contextUsageLabel(usage: SubagentUsage | undefined, model: SubagentModel | undefined): string {
  const current = usage === undefined ? undefined : currentTokens(usage);
  const peak = usage === undefined ? undefined : peakTokens(usage);
  const limit = contextLimitLabel(model);
  return `now ${current === undefined ? "—" : formatTokens(current)}${limit}${contextPercentLabel(current, model)} · peak ${peak === undefined ? "—" : formatTokens(peak)}${limit}${contextPercentLabel(peak, model)}`;
}

export { formatTokens };
