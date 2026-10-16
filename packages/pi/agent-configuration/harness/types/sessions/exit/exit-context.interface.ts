import type { ExtensionContext, ExtensionUIContext } from "@earendil-works/pi-coding-agent";

/** The parts of Pi's context that an explicit exit reads and acts on. */
export interface ExitContext {
  /** Pi run mode, which must be interactive for an exit. */
  readonly mode: string;
  /** Signal of the running agent, absent when no agent run is active. */
  readonly signal: ExtensionContext["signal"];
  /** Whether the agent has no running work. */
  readonly isIdle: () => boolean;
  /** Whether queued messages wait for delivery. */
  readonly hasPendingMessages: () => boolean;
  /** Aborts the running agent. */
  readonly abort: () => void;
  /** Shuts Pi down after the exit is confirmed. */
  readonly shutdown: () => void;
  /** Pi interface used to confirm the exit and report its outcome. */
  readonly ui: Pick<ExtensionUIContext, "confirm" | "getEditorText" | "notify">;
}
