import type { ActivityStatus } from "../../activity/store/activity-status.interface.ts";

/** Inputs for the heading line of a detail pane. */
export interface DetailHeadingOptions {
  /** Tool name of the selected call. */
  readonly tool: string;
  /** Arguments of the selected call. */
  readonly args: Record<string, unknown>;
  /** Lifecycle state of the selected call. */
  readonly status: ActivityStatus;
  /** Epoch milliseconds when the call started. */
  readonly startedAt: number;
}
