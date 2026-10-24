import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { THEME_ACCENT } from "../../split-view/theme-color.constant.ts";
import {
  EDIT_TOOL_NAME,
  READ_TOOL_NAME,
  RUN_TOOL_NAME,
  SEARCH_TOOL_NAME,
} from "../../tools/active-tools/harness-tools.constant.ts";

export const TOOL_COLORS: Record<HarnessTool, ThemeColor> = {
  [SEARCH_TOOL_NAME]: THEME_ACCENT,
  [READ_TOOL_NAME]: "success",
  [EDIT_TOOL_NAME]: "warning",
  [RUN_TOOL_NAME]: "toolTitle",
};
