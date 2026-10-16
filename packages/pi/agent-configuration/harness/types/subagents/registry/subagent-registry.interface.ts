import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { TaskInput } from "../tasks/task-input.interface.ts";
import type { TaskProgress } from "../tasks/task-progress.interface.ts";
import type { TaskProgressLookup } from "../tasks/task-progress-lookup.interface.ts";
import type { SubagentHandle } from "./subagent-handle.interface.ts";
import type { SubagentProgressListener } from "./subagent-progress-listener.interface.ts";

/* Starts, tracks, and cancels the subagent runs of a session. */
export interface SubagentRegistry {
  /* Starts a run and returns its handle. */
  create(input: TaskInput, ctx: ExtensionContext, onProgress: SubagentProgressListener): SubagentHandle;
  /* Looks up the progress of a run by its identifier. */
  status(id: string): TaskProgressLookup;
  /* Lists the progress of every known run. */
  list(): TaskProgress[];
  /* Requests cancellation of a running run; reports whether one was running. */
  cancel(id: string): boolean;
  /* Requests cancellation of every running run. */
  cancelAll(): void;
  /* Cancels every run and forgets them. */
  clear(): void;
}
