import { presentValue } from "../services/activity/value/present-value.service.ts";
import type { SubagentUsage } from "../types/activity/subagent-usage.interface.ts";

export function addSubagentUsage(current: SubagentUsage | undefined, next: SubagentUsage): SubagentUsage {
  const nextContextTokens = presentValue(next.contextTokens) ?? next.totalTokens;
  const currentContextTokens = current === undefined ? undefined : presentValue(current.contextTokens);
  const currentMaxContextTokens =
    (current === undefined ? undefined : presentValue(current.maxContextTokens)) ?? currentContextTokens ?? 0;
  const nextMaxContextTokens = presentValue(next.maxContextTokens) ?? nextContextTokens;
  return {
    inputTokens: (current?.inputTokens ?? 0) + next.inputTokens,
    outputTokens: (current?.outputTokens ?? 0) + next.outputTokens,
    cacheReadTokens: (current?.cacheReadTokens ?? 0) + next.cacheReadTokens,
    cacheWriteTokens: (current?.cacheWriteTokens ?? 0) + next.cacheWriteTokens,
    reasoningTokens: (current?.reasoningTokens ?? 0) + next.reasoningTokens,
    totalTokens: (current?.totalTokens ?? 0) + next.totalTokens,
    contextTokens: { state: "present", value: nextContextTokens },
    maxContextTokens: { state: "present", value: Math.max(currentMaxContextTokens, nextMaxContextTokens) },
  };
}
