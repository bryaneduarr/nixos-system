import { runCommand } from "../exec.ts";

export interface SearchMatch {
  file: string;
  line: number;
  text: string;
}

export async function rgMatches(
  cwd: string,
  query: string,
  scope: string | undefined,
  signal: AbortSignal | undefined,
): Promise<SearchMatch[]> {
  const argv = ["rg", "--json", "-n", "--no-messages", "-e", query];
  if (scope) argv.push("--", scope);
  const result = await runCommand({ argv, cwd, signal });
  if (result.code !== 0 && result.code !== 1) return [];
  const matches: SearchMatch[] = [];
  for (const rawLine of result.stdout.split("\n")) {
    if (!rawLine.trim()) continue;
    let event: {
      type?: string;
      data?: {
        path?: { text?: string };
        line_number?: number;
        lines?: { text?: string };
      };
    };
    try {
      event = JSON.parse(rawLine);
    } catch {
      continue;
    }
    if (event.type !== "match") continue;
    const file = event.data?.path?.text;
    const line = event.data?.line_number;
    const text = (event.data?.lines?.text ?? "").replace(/\r?\n$/, "");
    if (typeof file === "string" && typeof line === "number") {
      matches.push({ file, line, text });
    }
  }
  return matches;
}

export async function fdMatches(
  cwd: string,
  query: string,
  scope: string | undefined,
  signal: AbortSignal | undefined,
): Promise<string[]> {
  const argv = [
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
    scope ?? ".",
  ];
  const result = await runCommand({ argv, cwd, signal });
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
  scope: string | undefined,
  signal: AbortSignal | undefined,
): Promise<SearchMatch[]> {
  const argv = ["ast-grep", "run", "--pattern", query, "--json=stream"];
  if (scope) argv.push(scope);
  const result = await runCommand({ argv, cwd, signal });
  if (result.code !== 0) return [];
  const matches: SearchMatch[] = [];
  for (const rawLine of result.stdout.split("\n")) {
    if (!rawLine.trim()) continue;
    let event: {
      file?: string;
      lines?: string;
      range?: { start?: { line?: number } };
    };
    try {
      event = JSON.parse(rawLine);
    } catch {
      continue;
    }
    if (typeof event.file !== "string") continue;
    matches.push({
      file: event.file,
      line: (event.range?.start?.line ?? 0) + 1,
      text: (event.lines ?? "").split(/\r?\n/)[0],
    });
  }
  return matches;
}

export async function gitHistory(
  cwd: string,
  query: string,
  scope: string | undefined,
  limit: number,
  signal: AbortSignal | undefined,
): Promise<string> {
  const argv = ["git", "log", `-S${query}`, `-n${limit}`, "--oneline"];
  if (scope) argv.push("--", scope);
  const result = await runCommand({ argv, cwd, signal });
  if (result.code !== 0) {
    return `History unavailable: ${result.stderr.trim() || "not a git repository"}`;
  }
  const lines = result.stdout.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return `History:\nno commits touching "${query}"`;
  return `History:\n${lines.join("\n")}\n\nAdditional commits omitted: ${Math.max(0, lines.length - limit)}`;
}
