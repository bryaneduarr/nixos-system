import type { SubagentUsage, ToolActivity } from "../../activity/store.ts";

function formatTokens(tokens: number): string {
  if (tokens < 1000) return `${tokens}`;
  if (tokens < 1_000_000) {
    return `${(tokens / 1000).toFixed(tokens < 10_000 ? 1 : 0)}k`;
  }
  return `${(tokens / 1_000_000).toFixed(1)}m`;
}

function contextLimitLabel(model: ToolActivity["model"]): string {
  return model?.contextWindow && model.contextWindow > 0
    ? `/${formatTokens(model.contextWindow)}`
    : "";
}

function contextPercentLabel(
  tokens: number | undefined,
  model: ToolActivity["model"],
): string {
  if (tokens === undefined || !model?.contextWindow || model.contextWindow <= 0) {
    return "";
  }
  const percent = (tokens / model.contextWindow) * 100;
  return ` (${percent < 10 ? percent.toFixed(1) : Math.round(percent)}%)`;
}

export function modelLabel(model: ToolActivity["model"]): string {
  if (!model) return "model —";
  const qualified = `${model.provider}/${model.id}`;
  return model.name && model.name !== model.id
    ? `${model.name} (${qualified})`
    : qualified;
}

export function modelShortLabel(model: ToolActivity["model"]): string {
  if (!model) return "model —";
  return model.name ?? model.id;
}

export function usageLabel(
  usage: SubagentUsage | undefined,
  model: ToolActivity["model"],
): string {
  if (!usage) return "spent — · max ctx —";
  const peak = usage.maxContextTokens ?? usage.contextTokens;
  const peakLabel = peak === undefined ? "—" : formatTokens(peak);
  return `spent ${formatTokens(usage.totalTokens)} · max ctx ${peakLabel}${contextLimitLabel(model)}${contextPercentLabel(peak, model)}`;
}

export function compactUsageLabel(
  usage: SubagentUsage | undefined,
  model: ToolActivity["model"],
): string {
  if (!usage) return "spent — · peak —";
  const peak = usage.maxContextTokens ?? usage.contextTokens;
  return `spent ${formatTokens(usage.totalTokens)} · peak ${peak === undefined ? "—" : formatTokens(peak)}${contextLimitLabel(model)}`;
}

export function contextUsageLabel(
  usage: SubagentUsage | undefined,
  model: ToolActivity["model"],
): string {
  const current = usage?.contextTokens;
  const peak = usage?.maxContextTokens ?? current;
  const limit = contextLimitLabel(model);
  return `now ${current === undefined ? "—" : formatTokens(current)}${limit}${contextPercentLabel(current, model)} · peak ${peak === undefined ? "—" : formatTokens(peak)}${limit}${contextPercentLabel(peak, model)}`;
}

export { formatTokens };
