import { DOT_SEPARATOR } from "../../../../constants/text/separator.constant.ts";
import type { SubagentUsage } from "../../../../types/activity/parsing/subagent/subagent-usage.interface.ts";
import { formatTokens } from "../../format/format-tokens.service.ts";

export function turnUsageLabel(usage: SubagentUsage): string {
  return [
    `in ${formatTokens(usage.inputTokens)}`,
    `out ${formatTokens(usage.outputTokens)}`,
    `cache read ${formatTokens(usage.cacheReadTokens)}`,
    `cache write ${formatTokens(usage.cacheWriteTokens)}`,
  ].join(DOT_SEPARATOR);
}
