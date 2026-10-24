import type { TaskProgress } from "../../subagents/tasks/progress/task-progress.interface.ts";
import type { ArtifactPathLookup } from "../artifact/artifact-path-lookup.interface.ts";
import type { SubToolActivity } from "../parsing/subagent/sub-tool-activity.interface.ts";
import type { SubagentModel } from "../parsing/subagent/subagent-model.interface.ts";
import type { ToolActivityUsage } from "../parsing/subagent/tool-activity-usage.interface.ts";
import type { ValueState } from "../value/value-state.interface.ts";
import type { ActivityStatus } from "./activity-status.interface.ts";

/** A single tool call executed by the primary agent. */
export interface ToolActivity {
  /** Identifier of the tool call. */
  readonly id: string;
  /** Name of the tool that ran. */
  readonly toolName: string;
  /** Arguments the tool was called with. */
  readonly args: Readonly<Record<string, unknown>>;
  /** Lifecycle state of the call. */
  readonly status: ActivityStatus;
  /** Provider-reported usage for a delegated worker. */
  readonly usage: ToolActivityUsage;
  /** Model metadata captured for a delegated worker. */
  readonly model: ValueState<SubagentModel>;
  /** Effective thinking or reasoning level used by a delegated worker. */
  readonly thinkingLevel: ValueState<string>;
  /** Full, model-visible result text for this tool call. */
  readonly text: string;
  /** Task progress reported by a delegated worker, parsed from the result details. */
  readonly details: ValueState<TaskProgress>;
  /** Working directory the call ran in. */
  readonly cwd: string;
  /** Time the call started, in milliseconds since the epoch. */
  readonly startedAt: number;
  /** Time the call ended, once it has ended. */
  readonly endedAt: ValueState<number>;
  /** Saved full-output artifact referenced by the result text. */
  readonly artifactPath: ArtifactPathLookup;
  /** Nested worker tool calls, only present for the `task` tool. */
  readonly sub: readonly SubToolActivity[];
}
