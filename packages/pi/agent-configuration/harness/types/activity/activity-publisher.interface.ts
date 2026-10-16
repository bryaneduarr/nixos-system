import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/** Publishes the live activity summary widget and its spinner for the current session. */
export interface ActivityPublisher {
  /** Refreshes the summary widget and spinner state in the context. */
  publish(ctx: ExtensionContext): void;
  /** Remembers the context, notifies the inspector, and publishes. */
  touch(ctx: ExtensionContext): void;
  /** Records whether the primary agent is working. */
  setWorking(working: boolean): void;
  /** Starts advancing the spinner while the agent works. */
  startTicker(): void;
  /** Stops work and restarts the spinner from its first frame. */
  resetWork(): void;
  /** Stops work, and stops publishing to the context. */
  stopWork(): void;
  /** Stops work and removes the summary widget from the context. */
  close(ctx: ExtensionContext): void;
}
