import type { ToolActivityUsage } from "../../../../types/activity/parsing/subagent/tool-activity-usage.interface.ts";

const NOT_REPORTED_TEXT = "The provider did not report token usage.";
const LABEL_WIDTH = 12;

export function turnUsageDetail(usage: ToolActivityUsage): string {
  if (usage.usageState === "unreported") return NOT_REPORTED_TEXT;
  const { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, reasoningTokens, totalTokens } = usage.usage;
  return [
    detailLine("Input", inputTokens),
    detailLine("Output", outputTokens),
    detailLine("Cache read", cacheReadTokens),
    detailLine("Cache write", cacheWriteTokens),
    detailLine("Reasoning", reasoningTokens, " (included in output)"),
    detailLine("Total", totalTokens),
  ].join("\n");
}

function detailLine(label: string, tokens: number, note = ""): string {
  return `${label.padEnd(LABEL_WIDTH)}${tokens.toLocaleString("en-US")}${note}`;
}
