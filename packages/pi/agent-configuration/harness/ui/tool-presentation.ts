import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";
import { TextContentSchema } from "../schemas/tool-rendering/text-content.schema.ts";
import { type HarnessTool, isHarnessTool } from "../tools/config.ts";
import type {
  HarnessPresentation,
  HarnessVisualState,
} from "../types/tool-rendering/harness-presentation.interface.ts";
import type { TextContent } from "../types/tool-rendering/text-content.interface.ts";
import { oneLine } from "./formatting.ts";

const TITLES: Record<HarnessTool, string> = {
  search: "SEARCH",
  read: "READ",
  edit: "EDIT",
  run: "RUN",
};
const TOOL_COLORS: Record<HarnessTool, ThemeColor> = {
  search: "accent",
  read: "success",
  edit: "warning",
  run: "toolTitle",
};

export function extractText(content: readonly unknown[]): string {
  return content
    .filter((block): block is TextContent => Value.Check(TextContentSchema, block))
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function firstLine(text: string): string {
  return text.split(/\r?\n/, 1)[0] ?? "";
}

function stringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  return typeof value === "string" ? value : "";
}

export function toolLabel(name: string): string {
  return isHarnessTool(name) ? TITLES[name] : name.toUpperCase();
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

const SECTION_TITLES = new Set(["Definition:", "Files:", "Tests:", "References:", "History:", "Symbols:", "Head:"]);

function countSearchEntries(text: string): number {
  let count = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (
      !line ||
      line.startsWith("search ") ||
      SECTION_TITLES.has(line) ||
      line.startsWith("Additional ") ||
      line.startsWith("Full output:") ||
      (line.startsWith("[") && line.endsWith("]"))
    )
      continue;
    count += 1;
  }
  return count;
}

function readDetail(text: string): string {
  const head = firstLine(text);
  const structure = /\((\d+) lines, \d+ bytes\).*structure only/.exec(head);
  if (structure) return `${structure[1]} lines (structure)`;
  const range = /\(lines (\d+)-(\d+) of (\d+)\)/.exec(head);
  if (range) return `lines ${range[1]}-${range[2]} of ${range[3]}`;
  const total = /\((\d+) lines\)/.exec(head);
  if (total) return `${total[1]} lines`;
  return "Done";
}

function editDetail(text: string): string {
  const diff = /\+(\d+) -(\d+)/.exec(text);
  if (diff) return `+${diff[1]} -${diff[2]}`;
  if (text.startsWith("Moved:")) return text.split(/\r?\n/)[1]?.trim() ?? "Moved";
  return "Done";
}

function runDetail(text: string): string {
  const exit = /^exit:\s*(-?\d+)/.exec(text);
  const parts: string[] = [exit ? `exit ${exit[1]}` : "Done"];
  const tsErrors = /TypeScript errors: (\d+)/.exec(text);
  if (tsErrors) parts.push(`TypeScript ${tsErrors[1]} errors`);
  if (/\btimed out\b/.test(text)) parts.push("timed out");
  else if (/\bterminated\b/.test(text)) parts.push("terminated");
  return parts.join(", ");
}

export function resultFailed(tool: HarnessTool, text: string): boolean {
  switch (tool) {
    case "read":
      return text.startsWith("Unable to read") || /not found in /.test(firstLine(text));
    case "edit":
      return /^(?:Create|Delete|Move|Replace) failed:/.test(text);
    case "run":
      return /^exit:\s*(?!0\b)/.test(text);
    case "search":
      return text.startsWith("No query provided.") || text.startsWith("Limit must be greater than zero.");
    default:
      return false;
  }
}

function successDetail(tool: HarnessTool, text: string): string[] {
  switch (tool) {
    case "search": {
      const header = /^search ".*" \(([^)]+)\)/.exec(firstLine(text));
      if (/No (?:matches|files|structural)/.test(text)) return ["0 matches"];
      const count = countSearchEntries(text);
      const kind = header?.[1] && !header[1].includes("fallback") ? ` (${header[1]})` : "";
      return [`${count} match${count === 1 ? "" : "es"}${kind}`];
    }
    case "read":
      return [readDetail(text)];
    case "edit":
      return [editDetail(text)];
    case "run":
      return [runDetail(text)];
    default:
      return ["Done"];
  }
}

function errorDetail(tool: HarnessTool, text: string): string[] {
  if (tool === "run") return [runDetail(text)];
  const line = firstLine(text);
  return [line ? oneLine(line) : "error"];
}

export function runningPresentation(tool: HarnessTool, args: Record<string, unknown>): HarnessPresentation {
  return { title: TITLES[tool], target: toolTarget(tool, args), state: "running", details: [] };
}

export function resultPresentation(
  tool: HarnessTool,
  args: Record<string, unknown>,
  text: string,
  state: HarnessVisualState,
): HarnessPresentation {
  const base = { title: TITLES[tool], target: toolTarget(tool, args) };
  if (state === "running") return { ...base, state, details: [] };
  if (state === "error") return { ...base, state, details: errorDetail(tool, text) };
  return { ...base, state, details: successDetail(tool, text) };
}

export function presentationLines(presentation: HarnessPresentation, theme: Theme): string[] {
  const lines = [theme.fg("text", presentation.target)];
  if (presentation.state === "running") {
    lines.push(theme.fg("warning", "Running..."));
    return lines;
  }
  const [first, ...rest] = presentation.details;
  if (presentation.state === "error") {
    lines.push(theme.fg("error", `Failed - ${first ?? "error"}`));
    for (const detail of rest) lines.push(theme.fg("error", detail));
    return lines;
  }
  lines.push(theme.fg("success", `Done - ${first ?? "ok"}`));
  for (const detail of rest) lines.push(theme.fg("muted", detail));
  return lines;
}

export function toolColor(tool: HarnessTool): ThemeColor {
  return TOOL_COLORS[tool];
}

export function boxTitle(tool: HarnessTool, theme: Theme): string {
  return theme.fg("toolTitle", theme.bold(TITLES[tool]));
}
