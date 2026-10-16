import { Value } from "typebox/value";
import { RendererPayloadSchema } from "../../../schemas/activity/renderer-payload.schema.ts";
import type { RendererResult } from "../../../types/activity/renderer-result.interface.ts";
import { taskResultFailed } from "../../subagents/tasks/task-result-failed.service.ts";
import { extractText } from "../../tool-rendering/text/extract-text.service.ts";
import { readToolResultFields } from "../parsing/read-tool-result-fields.service.ts";

export function readRendererResult(value: unknown): RendererResult {
  if (!Value.Check(RendererPayloadSchema, value)) {
    return { text: "", fields: readToolResultFields(undefined), taskFailed: false };
  }
  return {
    text: extractText(value.content ?? []),
    fields: readToolResultFields(value.details),
    taskFailed: taskResultFailed(value.details),
  };
}
