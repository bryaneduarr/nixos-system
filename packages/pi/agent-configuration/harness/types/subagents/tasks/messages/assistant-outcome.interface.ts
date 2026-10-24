import type { ValueState } from "../../../activity/value/value-state.interface.ts";

/** Stop reason and error text of the last assistant message of a worker session. */
export interface AssistantOutcome {
  /** Why the assistant message stopped, when it reported a reason. */
  readonly stopReason: ValueState<string>;
  /** Error text the assistant message reported, when it reported one. */
  readonly errorMessage: ValueState<string>;
}
