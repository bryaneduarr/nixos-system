import type { ValueState } from "../../activity/value/value-state.interface.ts";

/** Progress of one tool call made by a codemode script. */
export type CodemodeCallStatus = "running" | "ok" | "error" | "cancelled";

/** One tool call made by a codemode script, as shown in the codemode box. */
export interface CodemodeCall {
  /** Registered name of the called tool. */
  readonly name: string;
  /** Progress of the call. */
  readonly status: CodemodeCallStatus;
  /** Duration in milliseconds once the call has finished. */
  readonly durationMs: ValueState<number>;
}
