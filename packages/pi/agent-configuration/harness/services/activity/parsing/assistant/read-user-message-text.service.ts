import { isRecord } from "../../../values/is-record.service.ts";

export function readUserMessageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter(isTextPart)
    .map((part) => part.text)
    .join("\n");
}

function isTextPart(part: unknown): part is { readonly type: "text"; readonly text: string } {
  return isRecord(part) && part.type === "text" && typeof part.text === "string";
}
