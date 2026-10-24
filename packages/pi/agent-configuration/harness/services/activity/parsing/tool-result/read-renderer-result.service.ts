import { Value } from "typebox/value";
import { RendererPayloadSchema } from "../../../../schemas/activity/parsing/tool-result/renderer-payload.schema.ts";
import type { RendererResult } from "../../../../types/activity/parsing/tool-result/renderer-result.interface.ts";
import { taskResultFailed } from "../../../subagents/result/task-result-failed.service.ts";
import { extractText } from "../../../tools/result/extract-text.service.ts";
import { readToolResultFields } from "./read-tool-result-fields.service.ts";

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
