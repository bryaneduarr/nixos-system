import { basename } from "node:path";
import type { HarnessTool } from "../tools/config.ts";
import { oneLine } from "./formatting.ts";

function stringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  return typeof value === "string" ? value : "";
}

export function workingMessageFor(tool: HarnessTool, args: Record<string, unknown>): string {
  switch (tool) {
    case "search":
      return "Searching repository...";
    case "read": {
      const path = stringArg(args, "path");
      return path ? `Reading ${basename(oneLine(path))}...` : "Reading source...";
    }
    case "edit": {
      const path = stringArg(args, "path") || stringArg(args, "from");
      return path ? `Editing ${basename(oneLine(path))}...` : "Editing files...";
    }
    case "run": {
      const command = stringArg(args, "command");
      if (/\bbiome\b/.test(command)) return "Running Biome...";
      if (/\btsc\b|typecheck|type-check/.test(command)) return "Checking TypeScript...";
      if (/\btest\b/.test(command)) return "Running tests...";
      return "Running command...";
    }
    default:
      return "Working...";
  }
}

export function phaseForTool(tool: HarnessTool, args: Record<string, unknown>): "DISCOVER" | "IMPLEMENT" | "VERIFY" {
  switch (tool) {
    case "search":
    case "read":
    case "edit":
      return "IMPLEMENT";
    case "run": {
      const command = stringArg(args, "command");
      return /\bbiome\b|\btsc\b|typecheck|type-check|\blint\b|\bcheck\b/.test(command) ? "VERIFY" : "IMPLEMENT";
    }
    default:
      return "DISCOVER";
  }
}
