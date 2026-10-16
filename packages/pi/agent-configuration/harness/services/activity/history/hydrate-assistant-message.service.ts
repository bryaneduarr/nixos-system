import { NO_TOOL_RESULT_FIELDS } from "../../../constants/activity/no-tool-result-fields.constant.ts";
import type { AssistantActivitySnapshot } from "../../../types/activity/agent-activity.interface.ts";
import type { HydrateAssistantInput } from "../../../types/activity/hydrate-assistant-input.interface.ts";
import { isRecord } from "../parsing/is-record.service.ts";
import { readAssistantActivity } from "../parsing/read-assistant-activity.service.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";
import { recordThinking } from "./record-thinking.service.ts";
import { recordUpdate } from "./record-update.service.ts";

export function hydrateAssistantMessage(input: HydrateAssistantInput): void {
  const { entryId, message, cwd, startedAt } = input;
  const trace = readAssistantActivity(message);
  if (trace.found) {
    hydrateAssistantText(entryId, trace.snapshot, cwd, startedAt);
  }
  if (Array.isArray(message.content)) {
    hydrateToolCalls(message.content, cwd, startedAt);
  }
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
