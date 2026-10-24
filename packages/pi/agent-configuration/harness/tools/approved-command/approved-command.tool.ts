import { defineTool } from "@earendil-works/pi-coding-agent";
import { APPROVED_COMMAND_TOOL } from "../../constants/subagents/roles/roles.constant.ts";
import { ApprovedCommandParams } from "../../schemas/subagents/approved-command/approved-command-params.schema.ts";
import { toValueState } from "../../services/activity/value/to-value-state.service.ts";
import { runApprovedCommand } from "../../services/subagents/approved-command/run-approved-command.service.ts";

export function createApprovedCommandTool(approvedCommands: readonly string[]) {
  return defineTool({
    name: APPROVED_COMMAND_TOOL,
    label: "Approved command",
    description: "Run one exact command approved by the parent for this assignment.",
    promptSnippet: "Run only an exact parent-approved verification command",
    promptGuidelines: ["Pass an approved command exactly as listed. Do not add flags or shell operators."],
    parameters: ApprovedCommandParams,
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const outcome = await runApprovedCommand({
        approvedCommands,
        command: params.command,
        cwd: ctx.cwd,
        signal: toValueState(signal),
      });

      return {
        content: [{ type: "text", text: outcome.text }],
        details: { command: params.command, exitCode: outcome.exitCode },
        isError: outcome.isError,
      };
    },
  });
}
