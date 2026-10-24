import type { ValueState } from "../../value/value-state.interface.ts";
import type { SubagentModel } from "./subagent-model.interface.ts";

/** Model and thinking level reported for a delegated worker. */
export interface SubagentMetadata {
  /** Model the worker ran with. */
  readonly model: ValueState<SubagentModel>;
  /** Effective thinking or reasoning level of the worker. */
  readonly thinkingLevel: ValueState<string>;
}
