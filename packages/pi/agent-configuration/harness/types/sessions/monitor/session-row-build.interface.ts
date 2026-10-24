import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { MonitoredSession } from "./monitored-session.interface.ts";
import type { SessionMonitorState } from "./session-monitor-state.interface.ts";

/** Facts from which the monitor builds the live record of a session. */
export interface SessionRowBuild {
  /** State of the session monitor. */
  readonly state: SessionMonitorState;
  /** Session being published. */
  readonly session: MonitoredSession;
  /** Latest Pi context of the session. */
  readonly ctx: ExtensionContext;
  /** Instance name reserved for the session. */
  readonly name: string;
}
