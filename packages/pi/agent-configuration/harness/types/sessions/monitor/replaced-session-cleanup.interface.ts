import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SessionDependencies } from "../install/session-dependencies.interface.ts";
import type { MonitoredSession } from "./monitored-session.interface.ts";
import type { SessionMonitorState } from "./session-monitor-state.interface.ts";

/** A session that a switch replaced and whose pane may close. */
export interface ReplacedSessionCleanup {
  /** State of the session monitor. */
  readonly state: SessionMonitorState;
  /** Pi context of the replaced session. */
  readonly ctx: ExtensionContext;
  /** External effects of the session commands. */
  readonly dependencies: SessionDependencies;
  /** Session that was replaced. */
  readonly session: MonitoredSession;
}
