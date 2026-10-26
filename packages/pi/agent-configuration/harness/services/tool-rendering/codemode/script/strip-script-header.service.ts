import { SCRIPT_HEADER_PATTERN } from "../../../../constants/tool-rendering/codemode/codemode-display.constant.ts";

export function stripScriptHeader(text: string): string {
  return text.replace(SCRIPT_HEADER_PATTERN, "").trim();
}
