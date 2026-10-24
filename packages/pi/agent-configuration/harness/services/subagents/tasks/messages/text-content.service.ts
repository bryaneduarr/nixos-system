import { isRecord } from "../../../values/is-record.service.ts";

interface TextPart {
  readonly type: "text";
  readonly text: string;
}

function isTextBlock(part: unknown): part is TextPart {
  return isRecord(part) && part.type === "text" && typeof part.text === "string";
}

export function textContent(content: unknown): string {
  if (!Array.isArray(content)) return "";

  return content
    .filter(isTextBlock)
    .map((part) => part.text)
    .join("\n");
}
