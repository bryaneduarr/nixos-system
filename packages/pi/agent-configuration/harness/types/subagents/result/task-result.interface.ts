import type { TaskProgress } from "../tasks/progress/task-progress.interface.ts";

/** Final report of a finished subagent run. */
export interface TaskResult extends TaskProgress {
  /** Short summary of what the worker did or found. */
  readonly summary: string;
  /** Findings the worker reported. */
  readonly findings: readonly string[];
  /** Questions the worker could not resolve. */
  readonly unresolvedQuestions: readonly string[];
  /** Checks the worker ran and their outcomes. */
  readonly checks: readonly string[];
  /** Paths the worker changed. */
  readonly filesChanged: readonly string[];
  /** Remaining risks the worker reported. */
  readonly risks: readonly string[];
  /** Errors the worker or run reported. */
  readonly errors: readonly string[];
}
