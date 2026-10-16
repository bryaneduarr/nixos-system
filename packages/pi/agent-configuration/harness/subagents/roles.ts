export const READ_ONLY_SUBAGENT_TOOLS = ["read", "grep", "find", "ls"] as const;
export const APPROVED_COMMAND_TOOL = "approved_command" as const;
export const TASK_TOOL_NAME = "task" as const;

export const SUBAGENT_TOOLS = [...READ_ONLY_SUBAGENT_TOOLS, "bash", "edit", "write", APPROVED_COMMAND_TOOL] as const;
export const DEFAULT_SUBAGENT_TOOLS = READ_ONLY_SUBAGENT_TOOLS;
const LEGACY_SUBAGENT_TOOLS = [...READ_ONLY_SUBAGENT_TOOLS, "bash", "edit", "write"] as const;

export const TASK_ROLES = [TASK_TOOL_NAME, "explore", "implement", "verify"] as const;

export type TaskRole = (typeof TASK_ROLES)[number];
export type SubagentTool = (typeof SUBAGENT_TOOLS)[number];

export interface TaskRoleInput {
  role?: unknown;
  tools?: readonly string[];
  verificationCommands?: readonly string[];
}

export interface ResolvedTaskRole {
  role: TaskRole;
  tools: SubagentTool[];
  verificationCommands: string[];
  instruction: string;
}

interface TaskRoleDefinition {
  defaultTools: readonly SubagentTool[];
  allowedTools: readonly SubagentTool[];
  instruction: string;
  acceptsVerificationCommands: boolean;
}

const ROLE_DEFINITIONS: Record<TaskRole, TaskRoleDefinition> = {
  task: {
    defaultTools: DEFAULT_SUBAGENT_TOOLS,
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
    defaultTools: [...READ_ONLY_SUBAGENT_TOOLS, "edit", "write"],
    allowedTools: [...READ_ONLY_SUBAGENT_TOOLS, "edit", "write", APPROVED_COMMAND_TOOL],
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

const LEGACY_SYSTEM_PROMPT = [
  "You are an isolated subagent.",
  "Complete the assigned mission and report only verified results.",
  "Use only your available tools and skills.",
  "End with status, summary, findings, files_changed, and errors sections.",
].join(" ");
const RESULT_FORMAT_INSTRUCTION = [
  "End with status, summary, findings, unresolved_questions, checks, files_changed, risks, and errors sections.",
  "Use an empty value when a section has no items.",
].join(" ");

export function resolveTaskRole(input: TaskRoleInput): ResolvedTaskRole {
  const role = input.role === undefined ? TASK_TOOL_NAME : input.role;
  if (typeof role !== "string" || !TASK_ROLES.includes(role as TaskRole)) {
    const allowedRoles = TASK_ROLES.join(", ");
    throw new Error(`Unknown task role: ${String(role)}. Allowed roles: ${allowedRoles}.`);
  }

  const definition = ROLE_DEFINITIONS[role as TaskRole];
  const verificationCommands = [...(input.verificationCommands ?? [])];
  if (verificationCommands.some((command) => !command.trim())) {
    throw new Error("Approved verification commands must not be empty.");
  }
  if (new Set(verificationCommands).size !== verificationCommands.length) {
    throw new Error("Approved verification commands must be unique.");
  }
  if (verificationCommands.length > 0 && !definition.acceptsVerificationCommands) {
    throw new Error(`Role "${role}" cannot receive approved verification commands.`);
  }

  const requestedTools = input.tools ? [...input.tools] : [...definition.defaultTools];
  if (!input.tools && verificationCommands.length > 0) {
    requestedTools.push(APPROVED_COMMAND_TOOL);
  }

  const disallowed = requestedTools.filter((tool) => !definition.allowedTools.includes(tool as SubagentTool));
  if (disallowed.length > 0) {
    const disallowedTools = disallowed.join(", ");
    throw new Error(`Role "${role}" cannot use tool(s): ${disallowedTools}.`);
  }
  if (requestedTools.includes(APPROVED_COMMAND_TOOL) && verificationCommands.length === 0) {
    const reason = [
      `Role "${role}" can use ${APPROVED_COMMAND_TOOL}`,
      "only when approved verification commands are provided.",
    ].join(" ");
    throw new Error(reason);
  }

  return {
    role: role as TaskRole,
    tools: requestedTools as SubagentTool[],
    verificationCommands,
    instruction: definition.instruction,
  };
}

export function buildTaskSystemPrompt(resolved: ResolvedTaskRole): string {
  if (resolved.role === TASK_TOOL_NAME) return LEGACY_SYSTEM_PROMPT;

  let commandInstructions = "No verification commands are approved. Do not run shell commands.";
  if (resolved.verificationCommands.length > 0) {
    const approvedCommands = resolved.verificationCommands.map((command) => `- ${command}`).join("\n");
    commandInstructions = [
      `You may run only these exact approved commands with ${APPROVED_COMMAND_TOOL}:`,
      approvedCommands,
    ].join("\n");
  }

  return [
    `You are an isolated subagent assigned the ${resolved.role} role.`,
    resolved.instruction,
    commandInstructions,
    "Use only your available tools and skills. Do not infer permission from the mission.",
    RESULT_FORMAT_INSTRUCTION,
  ].join("\n\n");
}
