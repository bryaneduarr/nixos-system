import type { SubagentTool } from "./subagent-tool.interface.ts";

/** Policy and instructions that define one task role. */
export interface TaskRoleDefinition {
  /** Tools granted when the request does not name tools. */
  readonly defaultTools: readonly SubagentTool[];
  /** Tools the role may be granted at most. */
  readonly allowedTools: readonly SubagentTool[];
  /** Role-specific instruction for the worker's system prompt. */
  readonly instruction: string;
  /** Whether the role may receive approved verification commands. */
  readonly acceptsVerificationCommands: boolean;
}
