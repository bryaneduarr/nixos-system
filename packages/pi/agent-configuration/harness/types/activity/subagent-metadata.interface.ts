import type { SubagentModel } from "./subagent-model.interface.ts";
import type { ValueState } from "./value-state.interface.ts";

/* Model and thinking level reported for a delegated worker. */
export interface SubagentMetadata {
  /* Model the worker ran with. */
  model: ValueState<SubagentModel>;
  /* Effective thinking or reasoning level of the worker. */
  thinkingLevel: ValueState<string>;
}
