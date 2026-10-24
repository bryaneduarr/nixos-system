import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SessionDependencies } from "../install/session-dependencies.interface.ts";
import type { MonitoredSession } from "./monitored-session.interface.ts";
import type { SessionMonitorState } from "./session-monitor-state.interface.ts";

/** A session switch or creation that runs one selection step against the monitored session. */
export interface SessionSwitch {
  /** State of the session monitor. */
  readonly state: SessionMonitorState;
  /** Pi context in which the switch was requested. */
  readonly ctx: ExtensionContext;
  /** External effects of the session commands. */
  readonly dependencies: SessionDependencies;
  /** Performs the selection and reports whether the current session was replaced. */
  readonly select: (session: MonitoredSession) => Promise<boolean>;
}
