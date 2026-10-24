import type { ScheduledCleanup } from "./scheduled-cleanup.interface.ts";
import type { UnscheduledCleanup } from "./unscheduled-cleanup.interface.ts";

/** Whether an explicit exit has scheduled a cleanup worker that can be cancelled. */
export type ExitCancellation = ScheduledCleanup | UnscheduledCleanup;
