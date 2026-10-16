export const READ_ONLY_SUBAGENT_TOOLS = ["read", "grep", "find", "ls"] as const;
export const APPROVED_COMMAND_TOOL = "approved_command" as const;
export const TASK_TOOL_NAME = "task" as const;

export const SUBAGENT_TOOLS = [...READ_ONLY_SUBAGENT_TOOLS, "bash", "edit", "write", APPROVED_COMMAND_TOOL] as const;
export const DEFAULT_SUBAGENT_TOOLS = READ_ONLY_SUBAGENT_TOOLS;
export const LEGACY_SUBAGENT_TOOLS = [...READ_ONLY_SUBAGENT_TOOLS, "bash", "edit", "write"] as const;

export const TASK_ROLES = [TASK_TOOL_NAME, "explore", "implement", "verify"] as const;
