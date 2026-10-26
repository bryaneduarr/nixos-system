import type { ModelStats } from "../../../types/sessions/stats/model-stats.interface.ts";
import type { SessionStats } from "../../../types/sessions/stats/session-stats.interface.ts";

const TOKENS_PER_THOUSAND = 1000;
const TOP_TOOL_COUNT = 10;

function ratio(part: number, whole: number): string {
  return whole > 0 ? (part / whole).toFixed(2) : "0.00";
}

function percent(part: number, whole: number): string {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "0%";
}

function formatModel(name: string, model: ModelStats): string {
  const averagePrompt = model.turns > 0 ? Math.round(model.promptTokens / model.turns / TOKENS_PER_THOUSAND) : 0;
  return [
    `${name}`,
    `  turns ${model.turns}, calls/turn ${ratio(model.toolCalls, model.turns)}, errors ${model.toolErrors}`,
    `  avg prompt ${averagePrompt}k, largest ${Math.round(model.largestPromptTokens / TOKENS_PER_THOUSAND)}k, cache hit ${percent(model.cacheReadTokens, model.promptTokens)}`,
    `  cost $${model.cost.toFixed(2)}, run calls starting with cd ${model.cdPrefixedRuns}`,
  ].join("\n");
}

export function formatSessionStats(stats: SessionStats, days: number): string {
  const models = [...stats.models.entries()].sort(([, left], [, right]) => right.turns - left.turns);
  const tools = [...stats.tools.entries()]
    .sort(([, left], [, right]) => right - left)
    .slice(0, TOP_TOOL_COUNT)
    .map(([name, count]) => `${name} ${count}`)
    .join(", ");
  return [
    `Sessions in the last ${days} days: ${stats.sessions}, compactions: ${stats.compactions}`,
    ...models.map(([name, model]) => formatModel(name, model)),
    `Top tools: ${tools || "none"}`,
  ].join("\n\n");
}
