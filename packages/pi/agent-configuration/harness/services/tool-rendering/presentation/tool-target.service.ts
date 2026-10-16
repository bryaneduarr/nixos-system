import type { HarnessTool } from "../../../types/tools/harness-tool.interface.ts";
import { oneLine } from "../text/one-line.service.ts";

function stringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  return typeof value === "string" ? value : "";
}

export function toolTarget(tool: HarnessTool, args: Record<string, unknown>): string {
  switch (tool) {
    case "search": {
      const query = oneLine(stringArg(args, "query"));
      const kind = stringArg(args, "kind");
      return kind && kind !== "auto" ? `${query} (${kind})` : query;
    }
    case "read":
      return oneLine(stringArg(args, "path"));
    case "edit": {
      const from = stringArg(args, "from") || stringArg(args, "path");
      const to = stringArg(args, "to");
      return to ? `${from} -> ${to}` : oneLine(from);
    }
    case "run":
      return oneLine(stringArg(args, "command"));
    default:
      return "";
  }
}
