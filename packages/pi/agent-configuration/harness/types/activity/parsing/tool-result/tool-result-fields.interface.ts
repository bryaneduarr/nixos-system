import type { TaskProgress } from "../../../subagents/tasks/progress/task-progress.interface.ts";
import type { ValueState } from "../../value/value-state.interface.ts";
import type { SubToolActivity } from "../subagent/sub-tool-activity.interface.ts";
import type { SubagentMetadata } from "../subagent/subagent-metadata.interface.ts";
import type { ToolActivityUsage } from "../subagent/tool-activity-usage.interface.ts";

/** Fields parsed from a tool result or partial result and applied to a recorded tool call. */
export interface ToolResultFields extends SubagentMetadata {
  /** Parsed task progress, applied only when present. */
  readonly details: ValueState<TaskProgress>;
  /** Nested worker tool calls, always applied. */
  readonly sub: readonly SubToolActivity[];
  /** Usage reported by a delegated worker, applied only when reported. */
  readonly usage: ToolActivityUsage;
}
