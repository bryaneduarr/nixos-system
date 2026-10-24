import { SCRIPT_TOOL_CALL_PATTERN } from "../../../../constants/tool-rendering/codemode/codemode-display.constant.ts";

export function readScriptToolNames(code: string): readonly string[] {
  return [...code.matchAll(SCRIPT_TOOL_CALL_PATTERN)].flatMap((match) => (match[1] === undefined ? [] : [match[1]]));
}
