import type { ToolResultFields } from "../parsing/tool-result/tool-result-fields.interface.ts";
import type { ValueState } from "../value/value-state.interface.ts";
import type { ActivityStatus } from "./activity-status.interface.ts";

/** Fields that refresh a running tool call. */
export interface ActivityUpdatePatch extends ToolResultFields {
  /** Latest result text. */
  readonly text: string;
  /** Latest lifecycle state, applied only when present. */
  readonly status: ValueState<ActivityStatus>;
}
