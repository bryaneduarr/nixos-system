import type { ActivityStatus } from "./activity-status.interface.ts";
import type { SubToolActivity } from "./sub-tool-activity.interface.ts";
import type { SubagentModel } from "./subagent-model.interface.ts";
import type { ToolActivityUsage } from "./tool-activity-usage.interface.ts";
import type { ValueState } from "./value-state.interface.ts";

/* Fields that refresh a running tool call; omitted fields keep their stored value. */
export interface ActivityUpdatePatch {
  /* Latest result text. */
  text?: string;
  /* Latest raw details payload. */
  details?: unknown;
  /* Latest nested worker tool calls. */
  sub?: SubToolActivity[];
  /* Latest lifecycle state. */
  status?: ActivityStatus;
  /* Usage reported so far, applied only when reported. */
  usage?: ToolActivityUsage;
  /* Model metadata, applied only when present. */
  model?: ValueState<SubagentModel>;
  /* Thinking level, applied only when present. */
  thinkingLevel?: ValueState<string>;
}
