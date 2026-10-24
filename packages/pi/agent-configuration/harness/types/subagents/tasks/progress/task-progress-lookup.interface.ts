import type { TaskProgress } from "./task-progress.interface.ts";

/** Result of finding the progress of a subagent run. */
export type TaskProgressLookup = { readonly found: true; readonly progress: TaskProgress } | { readonly found: false };
