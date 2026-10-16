import { Value } from "typebox/value";
import { RendererPayloadSchema } from "../../../schemas/activity/renderer-payload.schema.ts";
import type { RendererResult } from "../../../types/activity/renderer-result.interface.ts";
import { extractText } from "../../tool-rendering/text/extract-text.service.ts";

export function readRendererResult(value: unknown): RendererResult {
  if (!Value.Check(RendererPayloadSchema, value)) return { text: "", details: undefined };
  return { text: extractText(value.content ?? []), details: value.details };
}
