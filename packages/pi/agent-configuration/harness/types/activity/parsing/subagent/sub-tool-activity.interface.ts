import type { ActivityStatus } from "../../store/activity-status.interface.ts";
import type { ValueState } from "../../value/value-state.interface.ts";

/** A single tool call executed by a delegated worker (sub-agent). */
export interface SubToolActivity {
  /** Identifier of the tool call. */
  id: string;
  /** Name of the tool that ran. */
  toolName: string;
  /** Arguments the tool was called with. */
  args: Record<string, unknown>;
  /** Lifecycle state of the call. */
  status: ActivityStatus;
  /** Bounded, model-visible result text for this tool call. */
  text: string;
  /** Time the call started, in milliseconds since the epoch. */
  startedAt: number;
  /** Time the call ended, once it has ended. */
  endedAt: ValueState<number>;
}
