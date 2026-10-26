import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import { HARNESS_TOOLS, WEB_TOOLS } from "../../../constants/tools/active-tools/harness-tools.constant.ts";
import { BACKEND_TOOLS } from "../../../constants/tools/backends/backend-tools.constant.ts";
import { isMcpTool } from "./is-mcp-tool.service.ts";

export function enforceActiveTools(pi: ExtensionAPI): void {
  const registered = new Set(pi.getAllTools().map((tool) => tool.name));
  const registeredOptionalTools = [...WEB_TOOLS, ...BACKEND_TOOLS].filter((tool) => registered.has(tool));
  const activeMcpTools = pi.getActiveTools().filter(isMcpTool);
  pi.setActiveTools([...HARNESS_TOOLS, TASK_TOOL_NAME, ...registeredOptionalTools, ...activeMcpTools]);
}
