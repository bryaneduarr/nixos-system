import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { TaskProgress } from "../tasks/progress/task-progress.interface.ts";
import type { TaskProgressLookup } from "../tasks/progress/task-progress-lookup.interface.ts";
import type { TaskRequest } from "../tasks/run/task-request.interface.ts";
import type { SubagentHandle } from "./subagent-handle.interface.ts";
import type { SubagentProgressListener } from "./subagent-progress-listener.interface.ts";

/** Starts, tracks, and cancels the subagent runs of a session. */
export interface SubagentRegistry {
  /** Starts a run and returns its handle. */
  create(request: TaskRequest, ctx: ExtensionContext, onProgress: SubagentProgressListener): SubagentHandle;
  /** Looks up the progress of a run by its identifier. */
  status(id: string): TaskProgressLookup;
  /** Lists the progress of every known run. */
  list(): readonly TaskProgress[];
  /** Requests cancellation of a running run; reports whether one was running. */
  cancel(id: string): boolean;
  /** Requests cancellation of every running run. */
  cancelAll(): void;
  /** Cancels every run and forgets them. */
  clear(): void;
}
