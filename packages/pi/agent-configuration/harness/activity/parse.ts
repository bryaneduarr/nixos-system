import { Value } from "typebox/value";
import { SubToolActivityRecordSchema } from "../schemas/activity/sub-tool-activity.schema.ts";
import type { AssistantActivitySnapshot } from "../types/activity/agent-activity.interface.ts";
import type { SubToolActivity } from "../types/activity/sub-tool-activity.interface.ts";
import type { SubToolActivityRecord } from "../types/activity/sub-tool-activity-record.interface.ts";
import type { SubagentMetadata } from "../types/activity/subagent-metadata.interface.ts";
import type { SubagentModel } from "../types/activity/subagent-model.interface.ts";
import type { SubagentUsage } from "../types/activity/subagent-usage.interface.ts";
import type { ToolActivityUsage } from "../types/activity/tool-activity-usage.interface.ts";
import type { ValueState } from "../types/activity/value-state.interface.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readAssistantActivity(message: unknown): AssistantActivitySnapshot | undefined {
  if (!isRecord(message) || message.role !== "assistant" || !Array.isArray(message.content)) {
    return undefined;
  }
  let thinking = "";
  let thinkingRedacted = false;
  let response = "";
  let hasToolCall = false;
  for (const item of message.content) {
    if (!isRecord(item) || typeof item.type !== "string") continue;
    if (item.type === "thinking") {
      if (typeof item.thinking === "string") thinking += item.thinking;
      thinkingRedacted ||= item.redacted === true;
    } else if (item.type === "text" && typeof item.text === "string") {
      response += item.text;
    } else if (item.type === "toolCall") {
      hasToolCall = true;
    }
  }
  return { thinking, thinkingRedacted, response, hasToolCall };
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function nonNegativeNumberState(value: unknown): ValueState<number> {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? { state: "present", value }
    : { state: "absent" };
}

function stringState(value: unknown): ValueState<string> {
  return typeof value === "string" ? { state: "present", value } : { state: "absent" };
}

function nonEmptyStringState(value: unknown): ValueState<string> {
  return typeof value === "string" && value.length > 0 ? { state: "present", value } : { state: "absent" };
}

function booleanState(value: unknown): ValueState<boolean> {
  return typeof value === "boolean" ? { state: "present", value } : { state: "absent" };
}

export function readSubagentUsage(details: unknown): ToolActivityUsage {
  if (!isRecord(details) || !isRecord(details.usage)) return { usageState: "unreported" };
  const usage = details.usage;
  const hasUsage = Object.values(usage).some(
    (value) => typeof value === "number" && Number.isFinite(value) && value > 0,
  );
  if (!hasUsage) return { usageState: "unreported" };
  const inputTokens = numberValue(usage.inputTokens ?? usage.input);
  const outputTokens = numberValue(usage.outputTokens ?? usage.output);
  const cacheReadTokens = numberValue(usage.cacheReadTokens ?? usage.cacheRead);
  const cacheWriteTokens = numberValue(usage.cacheWriteTokens ?? usage.cacheWrite);
  const reasoningTokens = numberValue(usage.reasoningTokens ?? usage.reasoning);
  const reportedTotal = numberValue(usage.totalTokens);
  const reported: SubagentUsage = {
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    reasoningTokens,
    totalTokens: reportedTotal || inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens,
    contextTokens: nonNegativeNumberState(usage.contextTokens),
    maxContextTokens: nonNegativeNumberState(usage.maxContextTokens),
  };
  return { usageState: "reported", usage: reported };
}

function readSubagentModel(value: unknown): ValueState<SubagentModel> {
  if (!isRecord(value)) return { state: "absent" };
  const provider = value.provider;
  const id = value.id;
  if (typeof provider !== "string" || typeof id !== "string") return { state: "absent" };
  return {
    state: "present",
    value: {
      provider,
      id,
      name: stringState(value.name),
      reasoning: booleanState(value.reasoning),
      contextWindow: nonNegativeNumberState(value.contextWindow),
    },
  };
}

export function readSubagentMetadata(details: unknown): SubagentMetadata {
  if (!isRecord(details)) return { model: { state: "absent" }, thinkingLevel: { state: "absent" } };
  return {
    model: readSubagentModel(details.model),
    thinkingLevel: nonEmptyStringState(details.thinkingLevel),
  };
}

function toSubToolActivity(record: SubToolActivityRecord): SubToolActivity {
  return {
    id: record.id,
    toolName: record.toolName,
    args: record.args,
    status: record.status,
    text: record.text,
    startedAt: record.startedAt,
    endedAt: record.endedAt === undefined ? { state: "absent" } : { state: "present", value: record.endedAt },
  };
}

export function readSubActivity(details: unknown): SubToolActivity[] {
  if (!isRecord(details) || !Array.isArray(details.activity)) return [];
  return details.activity.flatMap((item: unknown) => {
    if (!Value.Check(SubToolActivityRecordSchema, item)) return [];
    return [toSubToolActivity(item)];
  });
}
