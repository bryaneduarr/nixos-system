import { EMPTY_TEXT_LABEL } from "../../../../constants/inspector/detail/label.constant.ts";

export function formatOutput(text: string): string {
  if (!text) return EMPTY_TEXT_LABEL;

  try {
    const parsed: unknown = JSON.parse(text);
    return JSON.stringify(parsed, null, 2) ?? text;
  } catch {
    return text;
  }
}
