import type { TaskResult } from "../result/task-result.interface.ts";

/** Reference to a started subagent run. */
export interface SubagentHandle {
  /** Identifier of the run. */
  readonly id: string;
  /** Settles with the final report of the run. */
  readonly result: Promise<TaskResult>;
}
