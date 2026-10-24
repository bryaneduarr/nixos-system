import type { ActivityStatus } from "../store/activity-status.interface.ts";

/** Status of one action counted in a message summary. */
export interface ActivityActionSummary {
  /** Lifecycle state of the action. */
  readonly status: ActivityStatus;
}
