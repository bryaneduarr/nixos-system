import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { firstLine } from "../text/first-line.service.ts";

export function resultFailed(tool: HarnessTool, text: string): boolean {
  switch (tool) {
    case "read":
      return text.startsWith("Unable to read") || /not found in /.test(firstLine(text));
    case "edit":
      return /^(?:Create|Delete|Move|Replace) failed:/.test(text);
    case "run":
      return /^exit:(?!\s*0\b)/.test(text);
    case "search":
      return (
        text.startsWith("No query provided.") ||
        text.startsWith("Limit must be greater than zero.") ||
        text.startsWith("Path not found:")
      );
    default:
      return false;
  }
}
