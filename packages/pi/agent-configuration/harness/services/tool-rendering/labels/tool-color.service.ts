import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import { TOOL_COLORS } from "../../../constants/tool-rendering/tool-color.constant.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";

export function toolColor(tool: HarnessTool): ThemeColor {
  return TOOL_COLORS[tool];
}
