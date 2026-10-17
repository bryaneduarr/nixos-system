import type { ActivityStatus } from "./activity-status.interface.ts";
import type { ToolResultFields } from "./tool-result-fields.interface.ts";
import type { ValueState } from "./value-state.interface.ts";

/** Fields that refresh a running tool call. */
export interface ActivityUpdatePatch extends ToolResultFields {
  /** Latest result text. */
  readonly text: string;
  /** Latest lifecycle state, applied only when present. */
  readonly status: ValueState<ActivityStatus>;
}
