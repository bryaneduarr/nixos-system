import type { TaskProgress } from "../subagents/tasks/task-progress.interface.ts";
import type { SubToolActivity } from "./sub-tool-activity.interface.ts";
import type { SubagentMetadata } from "./subagent-metadata.interface.ts";
import type { ToolActivityUsage } from "./tool-activity-usage.interface.ts";
import type { ValueState } from "./value-state.interface.ts";

/** Fields parsed from a tool result or partial result and applied to a recorded tool call. */
export interface ToolResultFields extends SubagentMetadata {
  /** Parsed task progress, applied only when present. */
  readonly details: ValueState<TaskProgress>;
  /** Nested worker tool calls, always applied. */
  readonly sub: readonly SubToolActivity[];
  /** Usage reported by a delegated worker, applied only when reported. */
  readonly usage: ToolActivityUsage;
}
