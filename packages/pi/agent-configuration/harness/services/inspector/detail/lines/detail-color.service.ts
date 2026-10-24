import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import { THEME_ACCENT, THEME_MUTED } from "../../../../constants/split-view/theme-color.constant.ts";
import { toolColor } from "../../../tool-rendering/labels/tool-color.service.ts";
import { isHarnessTool } from "../../../tools/active-tools/is-harness-tool.service.ts";
import { isPseudoEntryTool } from "../../entries/is-pseudo-entry-tool.service.ts";

export function detailColor(tool: string): ThemeColor {
  if (isHarnessTool(tool)) return toolColor(tool);
  return isPseudoEntryTool(tool) ? THEME_ACCENT : THEME_MUTED;
}
