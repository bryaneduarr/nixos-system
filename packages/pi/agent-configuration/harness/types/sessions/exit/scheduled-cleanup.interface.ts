import type { CleanupCancellation } from "../cleanup/worker/cleanup-cancellation.interface.ts";

/** Cleanup scheduled by an explicit exit that can still be cancelled. */
export interface ScheduledCleanup {
  /** Marks that a cleanup worker is scheduled. */
  readonly scheduled: true;
  /** Cancels the scheduled cleanup worker. */
  readonly cancel: CleanupCancellation;
}
