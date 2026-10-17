export const READ_ONLY_SUBAGENT_TOOLS = ["read", "grep", "find", "ls"] as const;
export const EDITING_SUBAGENT_TOOLS = ["edit", "write"] as const;
export const APPROVED_COMMAND_TOOL = "approved_command" as const;
export const TASK_TOOL_NAME = "task" as const;

export const SUBAGENT_TOOLS = [
  ...READ_ONLY_SUBAGENT_TOOLS,
  "bash",
  ...EDITING_SUBAGENT_TOOLS,
  APPROVED_COMMAND_TOOL,
] as const;
export const LEGACY_SUBAGENT_TOOLS = [...READ_ONLY_SUBAGENT_TOOLS, "bash", ...EDITING_SUBAGENT_TOOLS] as const;

export const IMPLEMENT_TASK_ROLE = "implement" as const;

export const TASK_ROLES = [TASK_TOOL_NAME, "explore", IMPLEMENT_TASK_ROLE, "verify"] as const;
