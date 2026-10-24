import { basename, resolve } from "node:path";
import type { HarnessTool } from "../../../types/tools/harness-tool.interface.ts";
import { splitLeadingCd } from "../../tools/run/split-leading-cd.service.ts";
import { oneLine } from "../text/one-line.service.ts";

function stringArg(args: Record<string, unknown>, key: string): string {
  const argument = args[key];
  return typeof argument === "string" ? argument : "";
}

function runTarget(command: string, cwd: string): string {
  const leadingCd = cwd ? { kind: "none" as const } : splitLeadingCd(command);
  const shownCommand = leadingCd.kind === "split" ? leadingCd.command : command;
  const directory = leadingCd.kind === "split" ? leadingCd.directory : cwd;
  const isSessionDirectory = !directory || resolve(directory) === process.cwd();
  const directoryLabel = isSessionDirectory ? "" : ` (in ${basename(directory)})`;
  return `${oneLine(shownCommand)}${directoryLabel}`;
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
      return runTarget(stringArg(args, "command"), stringArg(args, "cwd"));
    default:
      return "";
  }
}
