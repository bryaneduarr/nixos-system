import type { Theme } from "@earendil-works/pi-coding-agent";
import { TOOL_TITLES } from "../../../constants/tool-rendering/labels/tool-title.constant.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";

export function boxTitle(tool: HarnessTool, theme: Theme): string {
  return theme.fg("toolTitle", theme.bold(TOOL_TITLES[tool]));
}
