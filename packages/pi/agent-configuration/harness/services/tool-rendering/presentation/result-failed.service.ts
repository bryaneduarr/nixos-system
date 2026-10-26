import {
  EDIT_TOOL_NAME,
  READ_TOOL_NAME,
  RUN_TOOL_NAME,
  SEARCH_TOOL_NAME,
} from "../../../constants/tools/active-tools/harness-tools.constant.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { firstLine } from "../text/first-line.service.ts";

export function resultFailed(tool: HarnessTool, text: string): boolean {
  switch (tool) {
    case READ_TOOL_NAME:
      return text.startsWith("Unable to read") || /not found in /.test(firstLine(text));
    case EDIT_TOOL_NAME:
      return /^(?:Create|Delete|Move|Replace) failed:/.test(text);
    case RUN_TOOL_NAME:
      return /^exit:(?!\s*0\b)/.test(text);
    case SEARCH_TOOL_NAME:
      return (
        text.startsWith("No query provided.") ||
        text.startsWith("Limit must be greater than zero.") ||
        text.startsWith("Path not found:")
      );
    default:
      return tool satisfies never;
  }
}
