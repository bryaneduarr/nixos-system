import type { ValueState } from "../../activity/value/value-state.interface.ts";

/** Inputs of one approved command request from a worker. */
export interface RunApprovedCommandInput {
  /** Exact commands the parent approved for the worker. */
  readonly approvedCommands: readonly string[];
  /** Command the worker asked to run. */
  readonly command: string;
  /** Working directory the command runs in. */
  readonly cwd: string;
  /** Signal that cancels the command when the worker is stopped, when the caller provides one. */
  readonly signal: ValueState<AbortSignal>;
}
