import type { AgentSession } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../../activity/value/value-state.interface.ts";

/** Inputs that send one mission to a worker session and bound its runtime. */
export interface PromptTaskSessionInput {
  /** Worker session that receives the prompt. */
  readonly session: AgentSession;
  /** Prompt text with the context and mission of the task. */
  readonly prompt: string;
  /** Signal that aborts the worker when the parent cancels. */
  readonly signal: AbortSignal;
  /** Maximum runtime in milliseconds, when the task sets one. */
  readonly timeoutMs: ValueState<number>;
}
