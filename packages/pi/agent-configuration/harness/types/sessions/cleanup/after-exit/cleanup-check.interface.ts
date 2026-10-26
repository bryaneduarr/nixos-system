import type { LiveSession } from "../../registry/row/live-session.interface.ts";
import type { CleanupContext } from "./cleanup-context.interface.ts";

/** Session and activity facts that decide whether its pane may be cleaned up. */
export interface CleanupCheck {
  /** Live record of the session being checked. */
  readonly row: LiveSession;
  /** Pi context that reports the current activity. */
  readonly ctx: CleanupContext;
  /** Whether Pi is compacting the conversation. */
  readonly compacting: boolean;
  /** Whether the user ran a shell command in the session. */
  readonly userBash: boolean;
}
