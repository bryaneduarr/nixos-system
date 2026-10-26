import type { SubagentUsage } from "../../../../types/activity/parsing/subagent/subagent-usage.interface.ts";
import type { ToolActivityUsage } from "../../../../types/activity/parsing/subagent/tool-activity-usage.interface.ts";
import { isRecord } from "../../../values/is-record.service.ts";
import { readNonNegativeNumber } from "../../value/read-non-negative-number.service.ts";
import { readNonNegativeNumberState } from "../../value/read-non-negative-number-state.service.ts";

export function readSubagentUsage(details: unknown): ToolActivityUsage {
  if (!isRecord(details) || !isRecord(details.usage)) return { usageState: "unreported" };
  const usage = details.usage;
  const hasUsage = Object.values(usage).some(isPositiveNumber);
  if (!hasUsage) return { usageState: "unreported" };
  const inputTokens = readNonNegativeNumber(usage.inputTokens ?? usage.input);
  const outputTokens = readNonNegativeNumber(usage.outputTokens ?? usage.output);
  const cacheReadTokens = readNonNegativeNumber(usage.cacheReadTokens ?? usage.cacheRead);
  const cacheWriteTokens = readNonNegativeNumber(usage.cacheWriteTokens ?? usage.cacheWrite);
  const reasoningTokens = readNonNegativeNumber(usage.reasoningTokens ?? usage.reasoning);
  const reportedTotal = readNonNegativeNumber(usage.totalTokens);
  const reported: SubagentUsage = {
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    reasoningTokens,
    totalTokens: reportedTotal || inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens,
    contextTokens: readNonNegativeNumberState(usage.contextTokens),
    maxContextTokens: readNonNegativeNumberState(usage.maxContextTokens),
  };
  return { usageState: "reported", usage: reported };
}

function isPositiveNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
