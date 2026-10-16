import type { ActivityStatus } from "./activity-status.interface.ts";
import type { ArtifactPathLookup } from "./artifact-path.interface.ts";
import type { SubToolActivity } from "./sub-tool-activity.interface.ts";
import type { SubagentModel } from "./subagent-model.interface.ts";
import type { ToolActivityUsage } from "./tool-activity-usage.interface.ts";
import type { ValueState } from "./value-state.interface.ts";

/* A single tool call executed by the primary agent. */
export interface ToolActivity {
  /* Identifier of the tool call. */
  id: string;
  /* Name of the tool that ran. */
  toolName: string;
  /* Arguments the tool was called with. */
  args: Record<string, unknown>;
  /* Lifecycle state of the call. */
  status: ActivityStatus;
  /* Provider-reported usage for a delegated worker. */
  usage: ToolActivityUsage;
  /* Model metadata captured for a delegated worker. */
  model: ValueState<SubagentModel>;
  /* Effective thinking or reasoning level used by a delegated worker. */
  thinkingLevel: ValueState<string>;
  /* Full, model-visible result text for this tool call. */
  text: string;
  /* Raw details payload that the tool reported. */
  details: unknown;
  /* Working directory the call ran in. */
  cwd: string;
  /* Time the call started, in milliseconds since the epoch. */
  startedAt: number;
  /* Time the call ended, once it has ended. */
  endedAt: ValueState<number>;
  /* Saved full-output artifact referenced by the result text. */
  artifactPath: ArtifactPathLookup;
  /* Nested worker tool calls, only present for the `task` tool. */
  sub: SubToolActivity[];
}
