import { TOOL_TITLES } from "../../../constants/tool-rendering/tool-title.constant.ts";
import type { HarnessPresentation } from "../../../types/tool-rendering/presentation/harness-presentation.interface.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { toolTarget } from "../labels/tool-target.service.ts";

export function runningPresentation(tool: HarnessTool, args: Record<string, unknown>): HarnessPresentation {
  return { title: TOOL_TITLES[tool], target: toolTarget(tool, args), state: "running", details: [] };
}
