import { MCP_TOOL_PREFIX_PATTERN } from "../../../../constants/tool-rendering/codemode/codemode-display.constant.ts";

export function displayToolName(toolName: string): string {
  return toolName.replace(MCP_TOOL_PREFIX_PATTERN, "");
}
