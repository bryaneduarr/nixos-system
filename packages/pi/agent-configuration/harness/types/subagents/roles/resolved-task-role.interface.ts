import type { SubagentTool } from "./subagent-tool.interface.ts";
import type { TaskRole } from "./task-role.interface.ts";

/** Role after defaults and policy checks have been applied. */
export interface ResolvedTaskRole {
  /** Role the worker runs with. */
  readonly role: TaskRole;
  /** Tools the worker may call. */
  readonly tools: readonly SubagentTool[];
  /** Commands the worker may run through the approved command tool. */
  readonly verificationCommands: readonly string[];
  /** Role-specific instruction added to the worker's system prompt. */
  readonly instruction: string;
}
