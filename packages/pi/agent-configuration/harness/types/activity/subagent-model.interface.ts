import type { ValueState } from "./value-state.interface.ts";

/* Model that a delegated worker ran with. */
export interface SubagentModel {
  /* Provider that serves the model. */
  provider: string;
  /* Model identifier within the provider. */
  id: string;
  /* Human-readable model name. */
  name: ValueState<string>;
  /* Whether the model supports reasoning. */
  reasoning: ValueState<boolean>;
  /* Context window size of the model in tokens. */
  contextWindow: ValueState<number>;
}
