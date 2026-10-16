import type { ActivityStatus } from "./activity-status.interface.ts";
import type { SubToolActivity } from "./sub-tool-activity.interface.ts";
import type { SubagentModel } from "./subagent-model.interface.ts";
import type { ToolActivityUsage } from "./tool-activity-usage.interface.ts";
import type { ValueState } from "./value-state.interface.ts";

/* Fields that complete a tool call; omitted fields keep their stored value. */
export interface ActivityFinishPatch {
  /* Final result text. */
  text: string;
  /* Final raw details payload. */
  details?: unknown;
  /* Final nested worker tool calls. */
  sub?: SubToolActivity[];
  /* Usage reported by the run, applied only when reported. */
  usage?: ToolActivityUsage;
  /* Model metadata, applied only when present. */
  model?: ValueState<SubagentModel>;
  /* Thinking level, applied only when present. */
  thinkingLevel?: ValueState<string>;
  /* Final lifecycle state. */
  status: ActivityStatus;
  /* End time of the call, defaulting to now. */
  endedAt?: number;
}
