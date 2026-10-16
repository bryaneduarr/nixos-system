import { Value } from "typebox/value";
import { NO_TIMEOUT_MS } from "../../constants/tools/process.constant.ts";
import { AstGrepEventSchema } from "../../schemas/tools/search/ast-grep-event.schema.ts";
import { RgEventSchema } from "../../schemas/tools/search/rg-event.schema.ts";
import type { JsonLineParse } from "../../types/tools/process/json-line-parse.interface.ts";
import type { ToolCancellation } from "../../types/tools/process/tool-cancellation.interface.ts";
import type { SearchMatch } from "../../types/tools/search/search-match.interface.ts";
import type { SearchScope } from "../../types/tools/search/search-request.interface.ts";
import { runCommand } from "../exec.ts";

function parseJsonLine(line: string): JsonLineParse {
  try {
    return { parsed: true, value: JSON.parse(line) };
  } catch {
    return { parsed: false };
  }
}

export async function rgMatches(
  cwd: string,
  query: string,
  scope: SearchScope,
  cancellation: ToolCancellation,
): Promise<SearchMatch[]> {
  const argv: readonly [string, ...string[]] = [
    "rg",
    "--json",
    "-n",
    "--no-messages",
    "-e",
    query,
    ...(scope.kind === "path" ? ["--", scope.path] : []),
  ];
  const result = await runCommand({ command: { form: "argv", argv }, cwd, timeoutMs: NO_TIMEOUT_MS, cancellation });
  if (result.code !== 0 && result.code !== 1) return [];
  const matches: SearchMatch[] = [];
  for (const rawLine of result.stdout.split("\n")) {
    if (!rawLine.trim()) continue;
    const parsedLine = parseJsonLine(rawLine);
    if (!parsedLine.parsed || !Value.Check(RgEventSchema, parsedLine.value)) continue;
    const event = parsedLine.value;
    if (event.type !== "match") continue;
    matches.push({
      file: event.data.path.text,
      line: event.data.line_number,
      text: (event.data.lines?.text ?? "").replace(/\r?\n$/, ""),
    });
  }
  return matches;
}

export async function fdMatches(
  cwd: string,
  query: string,
  scope: SearchScope,
  cancellation: ToolCancellation,
): Promise<string[]> {
  const argv: readonly [string, ...string[]] = [
    "fd",
    "--type",
    "f",
    "--hidden",
    "--exclude",
    ".git",
    "--exclude",
    "node_modules",
    "--fixed-strings",
    query,
    scope.kind === "path" ? scope.path : ".",
  ];
  const result = await runCommand({ command: { form: "argv", argv }, cwd, timeoutMs: NO_TIMEOUT_MS, cancellation });
  if (result.code !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("./") ? line.slice(2) : line));
}

export async function structuralMatches(
  cwd: string,
  query: string,
  scope: SearchScope,
  cancellation: ToolCancellation,
): Promise<SearchMatch[]> {
  const argv: readonly [string, ...string[]] = [
    "ast-grep",
    "run",
    "--pattern",
    query,
    "--json=stream",
    ...(scope.kind === "path" ? [scope.path] : []),
  ];
  const result = await runCommand({ command: { form: "argv", argv }, cwd, timeoutMs: NO_TIMEOUT_MS, cancellation });
  if (result.code !== 0) return [];
  const matches: SearchMatch[] = [];
  for (const rawLine of result.stdout.split("\n")) {
    if (!rawLine.trim()) continue;
    const parsedLine = parseJsonLine(rawLine);
    if (!parsedLine.parsed || !Value.Check(AstGrepEventSchema, parsedLine.value)) continue;
    const event = parsedLine.value;
    const [firstLine = ""] = (event.lines ?? "").split(/\r?\n/);
    matches.push({
      file: event.file,
      line: event.range.start.line + 1,
      text: firstLine,
    });
  }
  return matches;
}

export async function gitHistory(
  cwd: string,
  query: string,
  scope: SearchScope,
  limit: number,
  cancellation: ToolCancellation,
): Promise<string> {
  const argv: readonly [string, ...string[]] = [
    "git",
    "log",
    `-S${query}`,
    `-n${limit}`,
    "--oneline",
    ...(scope.kind === "path" ? ["--", scope.path] : []),
  ];
  const result = await runCommand({ command: { form: "argv", argv }, cwd, timeoutMs: NO_TIMEOUT_MS, cancellation });
  if (result.code !== 0) {
    return `History unavailable: ${result.stderr.trim() || "not a git repository"}`;
  }
  const lines = result.stdout.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return `History:\nno commits touching "${query}"`;
  return `History:\n${lines.join("\n")}\n\nAdditional commits omitted: ${Math.max(0, lines.length - limit)}`;
}
