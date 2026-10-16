import type { TaskResult } from "../tasks/task-result.interface.ts";

/* Reference to a started subagent run. */
export interface SubagentHandle {
  /* Identifier of the run. */
  id: string;
  /* Settles with the final report of the run. */
  result: Promise<TaskResult>;
}
