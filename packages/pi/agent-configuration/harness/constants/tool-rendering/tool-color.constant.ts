import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import type { HarnessTool } from "../../types/tools/active-tools/harness-tool.interface.ts";
import { THEME_ACCENT } from "../split-view/theme-color.constant.ts";

export const TOOL_COLORS: Record<HarnessTool, ThemeColor> = {
  search: THEME_ACCENT,
  read: "success",
  edit: "warning",
  run: "toolTitle",
};
