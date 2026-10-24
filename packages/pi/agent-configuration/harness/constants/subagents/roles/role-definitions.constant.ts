import type { TaskRole } from "../../../types/subagents/roles/task-role.interface.ts";
import type { TaskRoleDefinition } from "../../../types/subagents/roles/task-role-definition.interface.ts";
import {
  APPROVED_COMMAND_TOOL,
  EDITING_SUBAGENT_TOOLS,
  LEGACY_SUBAGENT_TOOLS,
  READ_ONLY_SUBAGENT_TOOLS,
} from "./roles.constant.ts";

export const ROLE_DEFINITIONS: Record<TaskRole, TaskRoleDefinition> = {
  task: {
    defaultTools: READ_ONLY_SUBAGENT_TOOLS,
    allowedTools: LEGACY_SUBAGENT_TOOLS,
    instruction: "Complete the assigned mission and report only verified results.",
    acceptsVerificationCommands: false,
  },
  explore: {
    defaultTools: READ_ONLY_SUBAGENT_TOOLS,
    allowedTools: READ_ONLY_SUBAGENT_TOOLS,
    instruction: [
      "Map the bounded repository question.",
      "Cite repository paths in findings and list unresolved questions separately.",
      "Do not edit files or run commands.",
    ].join(" "),
    acceptsVerificationCommands: false,
  },
  implement: {
    defaultTools: [...READ_ONLY_SUBAGENT_TOOLS, ...EDITING_SUBAGENT_TOOLS],
    allowedTools: [...READ_ONLY_SUBAGENT_TOOLS, ...EDITING_SUBAGENT_TOOLS, APPROVED_COMMAND_TOOL],
    instruction: [
      "Make only the change authorized by the mission.",
      "Report changed paths, checks you ran and their results, and remaining risks.",
      "Do not claim checks you did not run.",
    ].join(" "),
    acceptsVerificationCommands: true,
  },
  verify: {
    defaultTools: READ_ONLY_SUBAGENT_TOOLS,
    allowedTools: [...READ_ONLY_SUBAGENT_TOOLS, APPROVED_COMMAND_TOOL],
    instruction: [
      "Check the requested change with fresh context.",
      "Do not modify files.",
      "If a check fails, stop and report the failure without repairing it.",
      "List passes, failures, and unverified requirements.",
    ].join(" "),
    acceptsVerificationCommands: true,
  },
};
