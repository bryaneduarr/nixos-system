import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/no-tool-result-fields.constant.ts";
import type { HydrateAssistantInput } from "../../../types/activity/hydrate/hydrate-assistant-input.interface.ts";
import type { AssistantActivitySnapshot } from "../../../types/activity/store/agent-activity.interface.ts";
import { readApiError } from "../parsing/assistant/read-api-error.service.ts";
import { readAssistantActivity } from "../parsing/assistant/read-assistant-activity.service.ts";
import { readSubagentUsage } from "../parsing/subagent/read-subagent-usage.service.ts";
import { recordApiError } from "../record/record-api-error.service.ts";
import { recordAssistantTurn } from "../record/record-assistant-turn.service.ts";
import { recordThinking } from "../record/record-thinking.service.ts";
import { recordUpdate } from "../record/record-update.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";
import { isRecord } from "../value/is-record.service.ts";

export function hydrateAssistantMessage(input: HydrateAssistantInput): void {
  const { entryId, message, cwd, startedAt } = input;
  const assistantActivity = readAssistantActivity(message);
  const apiError = readApiError(message);
  if (assistantActivity.found) {
    hydrateAssistantText(entryId, assistantActivity.snapshot, cwd, startedAt);
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
  if (apiError.state === "present") recordApiError(`api-error-${entryId}`, apiError.value, cwd, startedAt);
}

function hydrateAssistantText(
  entryId: string,
  snapshot: AssistantActivitySnapshot,
  cwd: string,
  startedAt: number,
): void {
  const { thinking, thinkingRedacted, response, hasToolCall } = snapshot;
  recordThinking(`thinking-${entryId}`, thinking, cwd, startedAt);
  if (hasToolCall && response.trim()) {
    const id = `update-${entryId}`;
    recordUpdate(id, response, cwd, startedAt);
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
