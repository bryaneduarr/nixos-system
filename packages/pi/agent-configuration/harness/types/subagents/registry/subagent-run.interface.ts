import type { TaskResult } from "../result/task-result.interface.ts";
import type { TaskProgress } from "../tasks/progress/task-progress.interface.ts";

/** Bookkeeping for a run held by the registry. */
export interface SubagentRun {
  /** Aborts the run when cancelled. */
  readonly controller: AbortController;
  /** Latest published progress of the run. */
  progress: TaskProgress;
  /** Settles with the final report of the run. */
  readonly result: Promise<TaskResult>;
}
