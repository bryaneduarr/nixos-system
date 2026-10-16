import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { toToolCancellation } from "../services/tools/process/tool-cancellation.service.ts";
import { runCommand } from "../tools/exec.ts";
import { clampLines } from "../tools/format.ts";
import { APPROVED_COMMAND_TOOL } from "./roles.ts";

const APPROVED_COMMAND_TIMEOUT_MS = 120_000;
const MAX_OUTPUT_CHARS = 6000;
const MAX_OUTPUT_LINES = 160;

const ApprovedCommandParams = Type.Object({
  command: Type.String({
    minLength: 1,
    description: "An exact command from the parent-approved list.",
  }),
});

export function createApprovedCommandTool(approvedCommands: readonly string[]) {
  return defineTool({
    name: APPROVED_COMMAND_TOOL,
    label: "Approved command",
    description: "Run one exact command approved by the parent for this assignment.",
    promptSnippet: "Run only an exact parent-approved verification command",
    promptGuidelines: ["Pass an approved command exactly as listed. Do not add flags or shell operators."],
    parameters: ApprovedCommandParams,
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      if (!approvedCommands.includes(params.command)) {
        return {
          content: [{ type: "text", text: "Blocked: command is not on the approved list." }],
          details: { command: params.command, exitCode: 126 },
          isError: true,
        };
      }

      const result = await runCommand({
        command: { form: "shell", shellLine: params.command },
        cwd: ctx.cwd,
        timeoutMs: APPROVED_COMMAND_TIMEOUT_MS,
        cancellation: toToolCancellation(signal),
      });
      const outputParts = [result.stdout, result.stderr].filter(Boolean);
      const separator = result.stdout && result.stderr ? "\n" : "";
      const rawOutput = outputParts.join(separator).trimEnd();
      const bounded = clampLines(rawOutput, MAX_OUTPUT_LINES, MAX_OUTPUT_CHARS);
      const outputLines = [`exit: ${result.code}`];

      if (result.timedOut) outputLines.push("timed out");
      if (result.killed && !result.timedOut) outputLines.push("terminated");
      if (bounded.text) outputLines.push(`\n${bounded.text}`);
      if (bounded.truncated) outputLines.push("\n[output truncated]");

      const output = outputLines.join("\n");
      return {
        content: [{ type: "text", text: output }],
        details: { command: params.command, exitCode: result.code },
        isError: false,
      };
    },
  });
}
