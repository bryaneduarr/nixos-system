import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles.constant.ts";
import { HARNESS_TOOLS, WEB_TOOLS } from "../../constants/tools/harness-tools.constant.ts";

export function enforceActiveTools(pi: ExtensionAPI): void {
  const registered = new Set(pi.getAllTools().map((tool) => tool.name));
  const activeWebTools = WEB_TOOLS.filter((tool) => registered.has(tool));
  pi.setActiveTools([...HARNESS_TOOLS, TASK_TOOL_NAME, ...activeWebTools]);
}
