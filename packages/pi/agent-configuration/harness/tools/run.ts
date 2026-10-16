import { writeArtifact } from "./artifacts.ts";
import { DEFAULT_RUN_TIMEOUT_MS } from "./config.ts";
import { runCommand } from "./exec.ts";
import { clampLines, headTail, splitLines } from "./format.ts";

export interface RunOptions {
  cwd: string;
  command: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

const MAX_INLINE_CHARS = 6000;
const MAX_INLINE_LINES = 160;

function summarize(output: string): string | undefined {
  const lines = splitLines(output);
  const tsErrors = lines.filter((line) => /error TS\d+/.test(line)).length;
  const genericErrors = lines.filter((line) => /(^|\s)(error|failed|exception):/i.test(line)).length;
  const parts: string[] = [];
  if (tsErrors > 0) parts.push(`TypeScript errors: ${tsErrors}`);
  if (genericErrors > 0) parts.push(`error lines: ${genericErrors}`);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

export async function runShell(options: RunOptions): Promise<string> {
  const command = options.command.trim();
  if (!command) return "exit: 2\n\nNo command provided.";

  const result = await runCommand({
    command,
    cwd: options.cwd,
    timeoutMs: options.timeoutMs ?? DEFAULT_RUN_TIMEOUT_MS,
    signal: options.signal,
  });

  const combined = [result.stdout, result.stderr]
    .filter((part) => part.trim().length > 0)
    .join(result.stdout && result.stderr ? "\n" : "")
    .trimEnd();

  const header = [
    `exit: ${result.code}`,
    result.timedOut ? "timed out" : "",
    result.killed && !result.timedOut ? "terminated" : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (!combined) {
    return header;
  }

  const lines = splitLines(combined);
  if (combined.length <= MAX_INLINE_CHARS && lines.length <= MAX_INLINE_LINES) {
    return `${header}\n\n${combined}`;
  }

  const artifact = await writeArtifact(options.cwd, "runs", "log", combined);
  const preview = headTail(combined, 60, 20).text;
  const clipped = clampLines(preview, MAX_INLINE_LINES, MAX_INLINE_CHARS).text;
  const summary = summarize(combined);
  const omitted = Math.max(0, lines.length - (60 + 20));

  return [
    header,
    summary ? `\n${summary}` : "",
    "",
    clipped,
    `\n... ${omitted} lines omitted ...`,
    `\nFull output:\n${artifact}`,
  ]
    .filter((part) => part !== "")
    .join("\n");
}
