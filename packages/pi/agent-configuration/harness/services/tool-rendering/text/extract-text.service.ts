import { Value } from "typebox/value";
import { TextContentSchema } from "../../../schemas/tool-rendering/text-content.schema.ts";
import type { TextContent } from "../../../types/tool-rendering/text-content.interface.ts";

export function extractText(content: readonly unknown[]): string {
  return content
    .filter((block): block is TextContent => Value.Check(TextContentSchema, block))
    .map((block) => block.text)
    .join("\n")
    .trim();
}
