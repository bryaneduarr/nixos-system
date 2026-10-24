import type { AgentSession } from "@earendil-works/pi-coding-agent";
import { USAGE_FIELDS } from "../../../../constants/subagents/tasks/messages/usage.constant.ts";
import type { SubagentUsage } from "../../../../types/activity/parsing/subagent/subagent-usage.interface.ts";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import { isRecord } from "../../../values/is-record.service.ts";
import { isAssistantMessage } from "./is-assistant-message.service.ts";

export function usageFromMessages(
  messages: AgentSession["messages"],
  contextTokens: ValueState<number>,
): SubagentUsage {
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
      const tokens = messageUsage[source];
      if (typeof tokens !== "number" || !Number.isFinite(tokens)) continue;

      usage[target] += tokens;
    }
  }

  usage.totalTokens = usage.inputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
  return usage;
}
