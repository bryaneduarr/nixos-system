import { LINE_BREAK_PATTERN } from "../../../../constants/inspector/detail/text.constant.ts";

export function formatValue(value: unknown): string {
  if (typeof value === "string") return value.replace(LINE_BREAK_PATTERN, "\n    ");
  if (value === undefined) return "";

  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}
