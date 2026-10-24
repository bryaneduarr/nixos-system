import { stripVTControlCharacters } from "node:util";
import { COMMAND_NOT_FOUND_EXIT_CODE } from "../../../constants/tools/process.constant.ts";
import { MISSING_COMMAND_HINT, RUN_HEAD_LINES, RUN_TAIL_LINES } from "../../../constants/tools/run-limits.constant.ts";
import { MAX_TEXT_CHARS, MAX_TEXT_LINES } from "../../../constants/tools/text-limits.constant.ts";
import { RUN_DIR, RUN_OUTPUT_EXTENSION } from "../../../constants/tools/workspace.constant.ts";
import type { RunRequest } from "../../../types/tools/run/run-request.interface.ts";
import { writeArtifact } from "../artifacts/write-artifact.service.ts";
import { runCommand } from "../process/run-command.service.ts";
import { clampLines } from "../text/clamp-lines.service.ts";
import { headTail } from "../text/head-tail.service.ts";
import { splitLines } from "../text/split-lines.service.ts";
import { summarizeOutput } from "./summarize-output.service.ts";

export async function runShell(request: RunRequest): Promise<string> {
  const command = request.command.trim();
  if (!command) return "exit: 2\n\nNo command provided.";

  const result = await runCommand({
    command: { form: "shell", shellLine: command },
    cwd: request.directory,
    timeoutMs: request.timeoutMs,
    cancellation: request.cancellation,
  });

  const combined = stripVTControlCharacters(
    [result.stdout, result.stderr]
      .filter((part) => part.trim().length > 0)
      .join(result.stdout && result.stderr ? "\n" : ""),
  ).trimEnd();

  const isTerminated = result.killed && !result.timedOut;
  const isMissingCommand = result.code === COMMAND_NOT_FOUND_EXIT_CODE;
  const header = [
    `exit: ${result.code}`,
    result.timedOut ? "timed out" : "",
    isTerminated ? "terminated" : "",
    isMissingCommand ? MISSING_COMMAND_HINT : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (!combined) {
    return header;
  }

  const lines = splitLines(combined);
  const fitsInline = combined.length <= MAX_TEXT_CHARS && lines.length <= MAX_TEXT_LINES;
  if (fitsInline) {
    return `${header}\n\n${combined}`;
  }

  const artifact = await writeArtifact(request.cwd, RUN_DIR, RUN_OUTPUT_EXTENSION, combined);
  const preview = headTail(combined, RUN_HEAD_LINES, RUN_TAIL_LINES).text;
  const clipped = clampLines(preview, MAX_TEXT_LINES, MAX_TEXT_CHARS).text;
  const summary = summarizeOutput(combined);
  const omitted = Math.max(0, lines.length - (RUN_HEAD_LINES + RUN_TAIL_LINES));

  return [
    header,
    summary.found ? `\n${summary.text}` : "",
    "",
    clipped,
    `\n... ${omitted} lines omitted ...`,
    `\nFull output:\n${artifact}`,
  ]
    .filter((part) => part !== "")
    .join("\n");
}
