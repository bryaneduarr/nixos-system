import { ROLE_DEFINITIONS } from "../../../constants/subagents/role-definitions.constant.ts";
import {
  APPROVED_COMMAND_TOOL,
  SUBAGENT_TOOLS,
  TASK_ROLES,
  TASK_TOOL_NAME,
} from "../../../constants/subagents/roles.constant.ts";
import type { ResolvedTaskRole } from "../../../types/subagents/roles/resolved-task-role.interface.ts";
import type { SubagentTool } from "../../../types/subagents/roles/subagent-tool.interface.ts";
import type { TaskRole } from "../../../types/subagents/roles/task-role.interface.ts";
import type { TaskRoleInput } from "../../../types/subagents/roles/task-role-input.interface.ts";
import { presentValue } from "../../activity/value/present-value.service.ts";

function isTaskRole(role: string): role is TaskRole {
  return TASK_ROLES.some((taskRole) => taskRole === role);
}

function isSubagentTool(tool: string): tool is SubagentTool {
  return SUBAGENT_TOOLS.some((subagentTool) => subagentTool === tool);
}

function hasBlankCommand(commands: readonly string[]): boolean {
  return commands.some((command) => command.trim() === "");
}

function hasDuplicateCommand(commands: readonly string[]): boolean {
  return new Set(commands).size !== commands.length;
}

export function resolveTaskRole(input: TaskRoleInput): ResolvedTaskRole {
  const requestedRole = presentValue(input.role) ?? TASK_TOOL_NAME;
  if (!isTaskRole(requestedRole)) {
    throw new Error(`Unknown task role: ${requestedRole}. Allowed roles: ${TASK_ROLES.join(", ")}.`);
  }

  const definition = ROLE_DEFINITIONS[requestedRole];
  const verificationCommands = [...(presentValue(input.verificationCommands) ?? [])];
  if (hasBlankCommand(verificationCommands)) {
    throw new Error("Approved verification commands must not be empty.");
  }
  if (hasDuplicateCommand(verificationCommands)) {
    throw new Error("Approved verification commands must be unique.");
  }

  const hasVerificationCommands = verificationCommands.length > 0;
  if (hasVerificationCommands && !definition.acceptsVerificationCommands) {
    throw new Error(`Role "${requestedRole}" cannot receive approved verification commands.`);
  }

  const requestedToolList = presentValue(input.tools);
  const requestedTools: string[] = requestedToolList ? [...requestedToolList] : [...definition.defaultTools];
  if (requestedToolList === undefined && hasVerificationCommands) {
    requestedTools.push(APPROVED_COMMAND_TOOL);
  }

  const disallowedTools = requestedTools.filter(
    (tool) => !definition.allowedTools.some((allowedTool) => allowedTool === tool),
  );
  if (disallowedTools.length > 0) {
    throw new Error(`Role "${requestedRole}" cannot use tool(s): ${disallowedTools.join(", ")}.`);
  }

  const requestsApprovedCommandTool = requestedTools.includes(APPROVED_COMMAND_TOOL);
  if (requestsApprovedCommandTool && !hasVerificationCommands) {
    throw new Error(
      [
        `Role "${requestedRole}" can use ${APPROVED_COMMAND_TOOL}`,
        "only when approved verification commands are provided.",
      ].join(" "),
    );
  }

  return {
    role: requestedRole,
    tools: requestedTools.filter(isSubagentTool),
    verificationCommands,
    instruction: definition.instruction,
  };
}
