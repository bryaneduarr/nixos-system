import type {
  AssistantActivitySnapshot,
  SubagentMetadata,
  SubagentModel,
  SubagentUsage,
  SubToolActivity,
} from "./store.ts";

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

function optionalNumberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function readSubagentUsage(details: unknown): SubagentUsage | undefined {
  if (!isRecord(details) || !isRecord(details.usage)) return undefined;
  const usage = details.usage;
  const hasUsage = Object.values(usage).some(
    (value) => typeof value === "number" && Number.isFinite(value) && value > 0,
  );
  if (!hasUsage) return undefined;
  const inputTokens = numberValue(usage.inputTokens ?? usage.input);
  const outputTokens = numberValue(usage.outputTokens ?? usage.output);
  const cacheReadTokens = numberValue(usage.cacheReadTokens ?? usage.cacheRead);
  const cacheWriteTokens = numberValue(usage.cacheWriteTokens ?? usage.cacheWrite);
  const reasoningTokens = numberValue(usage.reasoningTokens ?? usage.reasoning);
  const reportedTotal = numberValue(usage.totalTokens);
  const contextTokens = optionalNumberValue(usage.contextTokens);
  const maxContextTokens = optionalNumberValue(usage.maxContextTokens);
  return {
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    reasoningTokens,
    totalTokens: reportedTotal || inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens,
    ...(contextTokens === undefined ? {} : { contextTokens }),
    ...(maxContextTokens === undefined ? {} : { maxContextTokens }),
  };
}

export function readSubagentMetadata(details: unknown): SubagentMetadata {
  if (!isRecord(details)) return {};
  const rawModel = details.model;
  let model: SubagentModel | undefined;
  if (isRecord(rawModel)) {
    const provider = rawModel.provider;
    const id = rawModel.id;
    if (typeof provider === "string" && typeof id === "string") {
      const name = typeof rawModel.name === "string" ? rawModel.name : undefined;
      const reasoning = typeof rawModel.reasoning === "boolean" ? rawModel.reasoning : undefined;
      const contextWindow = optionalNumberValue(rawModel.contextWindow);
      model = {
        provider,
        id,
        ...(name === undefined ? {} : { name }),
        ...(reasoning === undefined ? {} : { reasoning }),
        ...(contextWindow === undefined ? {} : { contextWindow }),
      };
    }
  }
  const thinkingLevel =
    typeof details.thinkingLevel === "string" && details.thinkingLevel.length > 0 ? details.thinkingLevel : undefined;
  return {
    ...(model === undefined ? {} : { model }),
    ...(thinkingLevel === undefined ? {} : { thinkingLevel }),
  };
}

export function readSubActivity(details: unknown): SubToolActivity[] {
  if (!details || typeof details !== "object") return [];
  const value = (details as { activity?: unknown }).activity;
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is SubToolActivity =>
      typeof item === "object" && item !== null && typeof (item as { toolName?: unknown }).toolName === "string",
  );
}
