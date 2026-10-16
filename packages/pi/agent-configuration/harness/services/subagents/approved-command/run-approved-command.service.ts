import {
  APPROVED_COMMAND_MAX_OUTPUT_CHARS,
  APPROVED_COMMAND_MAX_OUTPUT_LINES,
  APPROVED_COMMAND_TIMEOUT_MS,
} from "../../../constants/subagents/approved-command.constant.ts";
import { runCommand } from "../../../tools/exec.ts";
import { clampLines } from "../../../tools/format.ts";
import type { ApprovedCommandOutcome } from "../../../types/subagents/approved-command/approved-command-outcome.interface.ts";
import type { RunApprovedCommandInput } from "../../../types/subagents/approved-command/run-approved-command-input.interface.ts";
import { toToolCancellation } from "../../tools/process/tool-cancellation.service.ts";

const REFUSED_EXIT_CODE = 126;

export async function runApprovedCommand(input: RunApprovedCommandInput): Promise<ApprovedCommandOutcome> {
  if (!input.approvedCommands.includes(input.command)) {
    return {
      text: "Blocked: command is not on the approved list.",
      exitCode: REFUSED_EXIT_CODE,
      isError: true,
    };
  }

  const result = await runCommand({
    command: { form: "shell", shellLine: input.command },
    cwd: input.cwd,
    timeoutMs: APPROVED_COMMAND_TIMEOUT_MS,
    cancellation: toToolCancellation(input.signal),
  });
  const outputParts = [result.stdout, result.stderr].filter(Boolean);
  const separator = result.stdout && result.stderr ? "\n" : "";
  const rawOutput = outputParts.join(separator).trimEnd();
  const bounded = clampLines(rawOutput, APPROVED_COMMAND_MAX_OUTPUT_LINES, APPROVED_COMMAND_MAX_OUTPUT_CHARS);
  const outputLines = [`exit: ${result.code}`];

  if (result.timedOut) outputLines.push("timed out");
  if (result.killed && !result.timedOut) outputLines.push("terminated");
  if (bounded.text) outputLines.push(`\n${bounded.text}`);
  if (bounded.truncated) outputLines.push("\n[output truncated]");

  return {
    text: outputLines.join("\n"),
    exitCode: result.code,
    isError: false,
  };
}
