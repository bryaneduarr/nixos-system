import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { HydrateAssistantInput } from "../../../types/activity/hydrate/hydrate-assistant-input.interface.ts";
import type { AssistantActivitySnapshot } from "../../../types/activity/store/assistant-activity-snapshot.interface.ts";
import { isRecord } from "../../values/is-record.service.ts";
import { readApiError } from "../parsing/assistant/read-api-error.service.ts";
import { readAssistantActivity } from "../parsing/assistant/read-assistant-activity.service.ts";
import { readSubagentUsage } from "../parsing/subagent/read-subagent-usage.service.ts";
import { recordApiError } from "../record/record-api-error.service.ts";
import { recordAssistantTurn } from "../record/record-assistant-turn.service.ts";
import { recordThinking } from "../record/record-thinking.service.ts";
import { recordUpdate } from "../record/record-update.service.ts";

export function hydrateAssistantMessage(input: HydrateAssistantInput): void {
  const { entryId, message, cwd, startedAt } = input;
  const assistantActivity = readAssistantActivity(message);
  const apiError = readApiError(message);
  if (assistantActivity.found) {
    hydrateAssistantText(input, assistantActivity.snapshot);
    recordAssistantTurn({
      idSuffix: entryId,
      snapshot: assistantActivity.snapshot,
      usage: readSubagentUsage(message),
      hasApiError: apiError.state === "present",
      cwd,
      startedAt,
      endedAt: startedAt,
    });
  }
  if (Array.isArray(message.content)) {
    hydrateToolCalls(message.content, cwd, startedAt);
  }
  if (apiError.state === "present")
    recordApiError({ id: `api-error-${entryId}`, message: apiError.value, cwd, occurredAt: startedAt });
}

function hydrateAssistantText(input: HydrateAssistantInput, snapshot: AssistantActivitySnapshot): void {
  const { entryId, cwd, startedAt } = input;
  const { thinking, thinkingRedacted, response, hasToolCall } = snapshot;
  recordThinking({ id: `thinking-${entryId}`, text: thinking, cwd, startedAt });
  if (hasToolCall && response.trim()) {
    const id = `update-${entryId}`;
    recordUpdate({ id, text: response, cwd, startedAt });
    activityStore.finish(id, { ...NO_TOOL_RESULT_FIELDS, text: response, status: "success", endedAt: startedAt });
  }
  if (thinking) {
    activityStore.finish(`thinking-${entryId}`, {
      ...NO_TOOL_RESULT_FIELDS,
      text: thinking,
      status: "success",
      endedAt: startedAt,
    });
  }
  activityStore.setPhase("idle");
  activityStore.setAssistantText({ thinking, thinkingRedacted, response, updatedAt: startedAt });
}

function hydrateToolCalls(content: readonly unknown[], cwd: string, startedAt: number): void {
  for (const part of content) {
    if (!isRecord(part) || part.type !== "toolCall") continue;
    if (typeof part.id !== "string" || typeof part.name !== "string") continue;
    activityStore.begin({
      id: part.id,
      toolName: part.name,
      args: isRecord(part.arguments) ? part.arguments : {},
      cwd,
      startedAt,
    });
  }
}
