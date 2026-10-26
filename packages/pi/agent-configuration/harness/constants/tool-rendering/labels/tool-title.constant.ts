import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import {
  EDIT_TOOL_NAME,
  READ_TOOL_NAME,
  RUN_TOOL_NAME,
  SEARCH_TOOL_NAME,
} from "../../tools/active-tools/harness-tools.constant.ts";

export const TOOL_TITLES: Record<HarnessTool, string> = {
  [SEARCH_TOOL_NAME]: "SEARCH",
  [READ_TOOL_NAME]: "READ",
  [EDIT_TOOL_NAME]: "EDIT",
  [RUN_TOOL_NAME]: "RUN",
};
