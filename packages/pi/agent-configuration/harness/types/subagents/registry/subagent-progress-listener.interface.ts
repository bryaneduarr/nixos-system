import type { TaskProgress } from "../tasks/progress/task-progress.interface.ts";

/** Receives each new progress snapshot of a subagent run. */
export type SubagentProgressListener = (progress: TaskProgress) => void;
