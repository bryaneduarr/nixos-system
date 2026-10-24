import type { ValueState } from "../../../activity/value/value-state.interface.ts";

/** How the prompt of a worker session ended before its result was read. */
export interface PromptTaskOutcome {
  /** Whether the runtime limit stopped the worker. */
  readonly timedOut: boolean;
  /** Error text raised while sending the prompt, when one was raised. */
  readonly promptError: ValueState<string>;
}
