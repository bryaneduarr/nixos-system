import {
  LEGACY_SYSTEM_PROMPT,
  NO_VERIFICATION_COMMANDS_INSTRUCTION,
  RESULT_FORMAT_INSTRUCTION,
  ROLE_SYSTEM_PROMPT_PREFIX,
  ROLE_TOOL_INSTRUCTION,
} from "../../../constants/subagents/roles/prompt.constant.ts";
import { APPROVED_COMMAND_TOOL, TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import type { ResolvedTaskRole } from "../../../types/subagents/roles/resolved-task-role.interface.ts";

function approvedCommandInstructions(commands: readonly string[]): string {
  const approvedCommandLines = commands.map((command) => `- ${command}`).join("\n");
  return [`You may run only these exact approved commands with ${APPROVED_COMMAND_TOOL}:`, approvedCommandLines].join(
    "\n",
  );
}

export function buildTaskSystemPrompt(resolved: ResolvedTaskRole): string {
  if (resolved.role === TASK_TOOL_NAME) return LEGACY_SYSTEM_PROMPT;

  const commandInstructions =
    resolved.verificationCommands.length > 0
      ? approvedCommandInstructions(resolved.verificationCommands)
      : NO_VERIFICATION_COMMANDS_INSTRUCTION;

  return [
    `${ROLE_SYSTEM_PROMPT_PREFIX} ${resolved.role} role.`,
    resolved.instruction,
    commandInstructions,
    ROLE_TOOL_INSTRUCTION,
    RESULT_FORMAT_INSTRUCTION,
  ].join("\n\n");
}
