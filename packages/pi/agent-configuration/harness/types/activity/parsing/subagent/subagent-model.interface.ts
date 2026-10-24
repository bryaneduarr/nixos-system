import type { ValueState } from "../../value/value-state.interface.ts";

/** Model that a delegated worker ran with. */
export interface SubagentModel {
  /** Provider that serves the model. */
  readonly provider: string;
  /** Model identifier within the provider. */
  readonly id: string;
  /** Display name of the model. */
  readonly name: ValueState<string>;
  /** Whether the model supports reasoning. */
  readonly reasoning: ValueState<boolean>;
  /** Context window size of the model in tokens. */
  readonly contextWindow: ValueState<number>;
}
