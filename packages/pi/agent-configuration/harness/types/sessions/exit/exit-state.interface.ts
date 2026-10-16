import type { CleanupCancellation } from "../cleanup-cancellation.interface.ts";

/** Cleanup scheduled by an explicit exit that can still be cancelled. */
export interface ScheduledCleanup {
  /** Marks that a cleanup worker is scheduled. */
  readonly scheduled: true;
  /** Cancels the scheduled cleanup worker. */
  readonly cancel: CleanupCancellation;
}

/** No cleanup worker is scheduled. */
export interface UnscheduledCleanup {
  /** Marks that no cleanup worker is scheduled. */
  readonly scheduled: false;
}

/** Whether an explicit exit has scheduled a cleanup worker that can be cancelled. */
export type ExitCancellation = ScheduledCleanup | UnscheduledCleanup;

/** Process-wide state of explicit exit, shared across reloads of the extension. */
export interface ExitState {
  /** Advances on every session shutdown so that pending exits notice they are stale. */
  generation: number;
  /** Whether an exit request is currently being handled. */
  busy: boolean;
  /** Whether an exit has been requested and Pi is shutting down. */
  requested: boolean;
  /** Cleanup scheduled for the pending exit. */
  cancellation: ExitCancellation;
}
