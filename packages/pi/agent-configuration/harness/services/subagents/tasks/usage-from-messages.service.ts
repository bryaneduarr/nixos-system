import { USAGE_FIELDS } from "../../../constants/subagents/usage.constant.ts";
import type { SubagentUsage } from "../../../types/activity/subagent-usage.interface.ts";
import type { ValueState } from "../../../types/activity/value-state.interface.ts";
import { isAssistantMessage } from "./is-assistant-message.service.ts";
import { isRecord } from "./is-record.service.ts";

export function usageFromMessages(messages: readonly unknown[], contextTokens: ValueState<number>): SubagentUsage {
  const usage: SubagentUsage = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
    totalTokens: 0,
    contextTokens,
    maxContextTokens: { state: "absent" },
  };

  for (const message of messages.filter(isAssistantMessage)) {
    const messageUsage = message.usage;
    if (!isRecord(messageUsage)) continue;

    for (const [target, source] of USAGE_FIELDS) {
      const value = messageUsage[source];
      if (typeof value !== "number" || !Number.isFinite(value)) continue;

      usage[target] += value;
    }
  }

  usage.totalTokens = usage.inputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
  return usage;
}
