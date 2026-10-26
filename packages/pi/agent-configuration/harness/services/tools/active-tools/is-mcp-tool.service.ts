import { BUILTIN_MCP_TOOLS, MCP_TOOL_PREFIX } from "../../../constants/tools/active-tools/mcp-tools.constant.ts";

const BUILTIN_MCP_TOOL_NAMES: ReadonlySet<string> = new Set<string>(BUILTIN_MCP_TOOLS);

export function isMcpTool(name: string): boolean {
  return name.startsWith(MCP_TOOL_PREFIX) || BUILTIN_MCP_TOOL_NAMES.has(name);
}
