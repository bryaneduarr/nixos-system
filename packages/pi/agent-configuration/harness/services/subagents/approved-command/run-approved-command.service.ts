import {
  APPROVED_COMMAND_MAX_OUTPUT_CHARS,
  APPROVED_COMMAND_MAX_OUTPUT_LINES,
  APPROVED_COMMAND_REFUSED_EXIT_CODE,
  APPROVED_COMMAND_TIMEOUT_MS,
} from "../../../constants/subagents/approved-command/approved-command.constant.ts";
import type { ApprovedCommandOutcome } from "../../../types/subagents/approved-command/approved-command-outcome.interface.ts";
import type { RunApprovedCommandInput } from "../../../types/subagents/approved-command/run-approved-command-input.interface.ts";
import { runCommand } from "../../tools/process/run-command.service.ts";
import { toToolCancellation } from "../../tools/process/tool-cancellation.service.ts";
import { clampLines } from "../../tools/text/clamp-lines.service.ts";

export async function runApprovedCommand(input: RunApprovedCommandInput): Promise<ApprovedCommandOutcome> {
  if (!input.approvedCommands.includes(input.command)) {
    return {
      text: "Blocked: command is not on the approved list.",
      exitCode: APPROVED_COMMAND_REFUSED_EXIT_CODE,
      isError: true,
    };
  }

  const result = await runCommand({
    command: { form: "shell", shellLine: input.command },
    cwd: input.cwd,
    timeoutMs: APPROVED_COMMAND_TIMEOUT_MS,
    cancellation: toToolCancellation(input.signal.state === "present" ? input.signal.value : undefined),
  });
  const outputParts = [result.stdout, result.stderr].filter(Boolean);
  const separator = result.stdout && result.stderr ? "\n" : "";
  const rawOutput = outputParts.join(separator).trimEnd();
  const bounded = clampLines(rawOutput, APPROVED_COMMAND_MAX_OUTPUT_LINES, APPROVED_COMMAND_MAX_OUTPUT_CHARS);
  const outputLines = [`exit: ${result.code}`];

  const isKilledByOtherCause = result.killed && !result.timedOut;
  if (result.timedOut) outputLines.push("timed out");
  if (isKilledByOtherCause) outputLines.push("terminated");
  if (bounded.text) outputLines.push(`\n${bounded.text}`);
  if (bounded.truncated) outputLines.push("\n[output truncated]");

  return {
    text: outputLines.join("\n"),
    exitCode: result.code,
    isError: false,
  };
}
