import type { TaskProgress } from "./task-progress.interface.ts";

/* Final report of a finished subagent run. */
export interface TaskResult extends TaskProgress {
  /* Short summary of what the worker did or found. */
  summary: string;
  /* Findings the worker reported. */
  findings: string[];
  /* Questions the worker could not resolve. */
  unresolvedQuestions: string[];
  /* Checks the worker ran and their outcomes. */
  checks: string[];
  /* Paths the worker changed. */
  filesChanged: string[];
  /* Remaining risks the worker reported. */
  risks: string[];
  /* Errors the worker or run reported. */
  errors: string[];
}
