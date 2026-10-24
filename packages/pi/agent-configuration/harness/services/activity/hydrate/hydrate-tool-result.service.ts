import { activityStore } from "../../../stores/activity/activity.store.ts";
import type { HydrateToolResultInput } from "../../../types/activity/hydrate/hydrate-tool-result-input.interface.ts";
import { taskResultFailed } from "../../subagents/result/task-result-failed.service.ts";
import { extractText } from "../../tools/result/extract-text.service.ts";
import { readToolResultFields } from "../parsing/tool-result/read-tool-result-fields.service.ts";
import { readToolResultStatus } from "../parsing/tool-result/read-tool-result-status.service.ts";

export function hydrateToolResult(input: HydrateToolResultInput): void {
  const { id, message, cwd, startedAt } = input;
  const lookup = activityStore.lookup(id);
  const toolName =
    typeof message.toolName === "string" ? message.toolName : lookup.found ? lookup.entry.toolName : undefined;
  if (toolName === undefined) return;
  const text = extractText(Array.isArray(message.content) ? message.content : []);
  const status = readToolResultStatus({
    toolName,
    text,
    isError: message.isError === true,
    taskFailed: taskResultFailed(message.details),
  });
  activityStore.begin({
    id,
    toolName,
    args: lookup.found ? lookup.entry.args : {},
    cwd,
    startedAt: lookup.found ? lookup.entry.startedAt : startedAt,
  });
  activityStore.finish(id, { ...readToolResultFields(message.details), text, status, endedAt: startedAt });
}
