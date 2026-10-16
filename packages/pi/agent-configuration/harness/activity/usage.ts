import type { SubagentUsage } from "./store.ts";

export function addSubagentUsage(current: SubagentUsage | undefined, next: SubagentUsage): SubagentUsage {
  const nextContextTokens = next.contextTokens ?? next.totalTokens;
  const currentContextTokens = current?.contextTokens;
  const currentMaxContextTokens = current?.maxContextTokens ?? currentContextTokens ?? 0;
  const nextMaxContextTokens = next.maxContextTokens ?? nextContextTokens;
  return {
    inputTokens: (current?.inputTokens ?? 0) + next.inputTokens,
    outputTokens: (current?.outputTokens ?? 0) + next.outputTokens,
    cacheReadTokens: (current?.cacheReadTokens ?? 0) + next.cacheReadTokens,
    cacheWriteTokens: (current?.cacheWriteTokens ?? 0) + next.cacheWriteTokens,
    reasoningTokens: (current?.reasoningTokens ?? 0) + next.reasoningTokens,
    totalTokens: (current?.totalTokens ?? 0) + next.totalTokens,
    contextTokens: nextContextTokens,
    maxContextTokens: Math.max(currentMaxContextTokens, nextMaxContextTokens),
  };
}
