import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import type { HarnessTool } from "../../types/tools/active-tools/harness-tool.interface.ts";

export const TOOL_COLORS: Record<HarnessTool, ThemeColor> = {
  search: "accent",
  read: "success",
  edit: "warning",
  run: "toolTitle",
};
