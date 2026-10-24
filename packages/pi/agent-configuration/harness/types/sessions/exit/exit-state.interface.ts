import type { ExitCancellation } from "./exit-cancellation.interface.ts";

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
