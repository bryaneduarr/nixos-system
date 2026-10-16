import { RUN_HEAD_LINES, RUN_TAIL_LINES } from "../constants/tools/run-limits.constant.ts";
import { MAX_TEXT_CHARS, MAX_TEXT_LINES } from "../constants/tools/text-limits.constant.ts";
import { RUN_DIR } from "../constants/tools/workspace.constant.ts";
import type { RunRequest } from "../types/tools/run/run-request.interface.ts";
import { writeArtifact } from "./artifacts.ts";
import { runCommand } from "./exec.ts";
import { clampLines, headTail, splitLines } from "./format.ts";

function summarize(output: string): string | undefined {
  const lines = splitLines(output);
  const tsErrors = lines.filter((line) => /error TS\d+/.test(line)).length;
  const genericErrors = lines.filter((line) => /(^|\s)(error|failed|exception):/i.test(line)).length;
  const parts: string[] = [];
  if (tsErrors > 0) parts.push(`TypeScript errors: ${tsErrors}`);
  if (genericErrors > 0) parts.push(`error lines: ${genericErrors}`);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

export async function runShell(request: RunRequest): Promise<string> {
  const command = request.command.trim();
  if (!command) return "exit: 2\n\nNo command provided.";

  const result = await runCommand({
    command: { form: "shell", shellLine: command },
    cwd: request.cwd,
    timeoutMs: request.timeoutMs,
    cancellation: request.cancellation,
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
  if (combined.length <= MAX_TEXT_CHARS && lines.length <= MAX_TEXT_LINES) {
    return `${header}\n\n${combined}`;
  }

  const artifact = await writeArtifact(request.cwd, RUN_DIR, "log", combined);
  const preview = headTail(combined, RUN_HEAD_LINES, RUN_TAIL_LINES).text;
  const clipped = clampLines(preview, MAX_TEXT_LINES, MAX_TEXT_CHARS).text;
  const summary = summarize(combined);
  const omitted = Math.max(0, lines.length - (RUN_HEAD_LINES + RUN_TAIL_LINES));

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
