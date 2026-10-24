import type { ExtensionContext, ExtensionUIContext } from "@earendil-works/pi-coding-agent";

/** The parts of Pi's context that decide whether a session may be cleaned up. */
export interface CleanupContext {
  /** Signal of the running agent, absent when no agent run is active. */
  readonly signal: ExtensionContext["signal"];
  /** Whether the agent has no running work. */
  readonly isIdle: () => boolean;
  /** Whether queued messages wait for delivery. */
  readonly hasPendingMessages: () => boolean;
  /** Pi interface that reports the editor draft. */
  readonly ui: Pick<ExtensionUIContext, "getEditorText">;
}
