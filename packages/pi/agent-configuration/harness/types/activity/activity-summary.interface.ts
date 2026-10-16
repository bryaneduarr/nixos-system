import type { ActivityStatus } from "./activity-status.interface.ts";

/* Status of one action counted in a message summary. */
export interface ActivityActionSummary {
  /* Lifecycle state of the action. */
  status: ActivityStatus;
}

/* Data needed to render the summary of one user message. */
export interface ActivitySummaryData {
  /* Ordinal of the user message being summarized. */
  messageNumber: number;
}
