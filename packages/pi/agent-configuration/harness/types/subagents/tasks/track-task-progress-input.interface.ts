import type { AgentSession } from "@earendil-works/pi-coding-agent";
import type { TaskProgress } from "./task-progress.interface.ts";

/** Session and progress state that a tracker keeps up to date. */
export interface TrackTaskProgressInput {
  /** Worker session whose events update the progress. */
  readonly session: AgentSession;
  /** Progress state that the events change in place. */
  readonly progress: TaskProgress;
  /** Publishes a snapshot of the progress to the parent. */
  readonly publish: () => void;
}
