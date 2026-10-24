import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../activity/value/value-state.interface.ts";
import type { HerdrSessions } from "../herdr/herdr-sessions.interface.ts";
import type { PaneIdentity } from "../herdr/pane/pane-identity.interface.ts";
import type { LiveSession } from "../registry/row/live-session.interface.ts";
import type { SessionRegistry } from "../registry/row/session-registry.interface.ts";

/** Herdr-managed Pi session that the monitor publishes after a session start. */
export interface MonitoredSession {
  /** Stable identifier of the Pi session, a UUID. */
  readonly identity: string;
  /** Canonical project directory of the session. */
  readonly cwd: string;
  /** Absolute path of the Herdr socket that scopes every command. */
  readonly socket: string;
  /** Registry that stores live records of this socket scope. */
  readonly registry: SessionRegistry;
  /** Herdr operations bound to this socket scope. */
  readonly herdr: HerdrSessions;
  /** Herdr location of the pane that hosts the session. */
  readonly pane: PaneIdentity;
  /** Latest Pi context that an event delivered. */
  context: ExtensionContext;
  /** Instance name of the session, once it has been reserved. */
  name: ValueState<string>;
  /** Most recent live record published for the session. */
  latest: ValueState<LiveSession>;
  /** Key of the most recent Herdr state report. */
  reported: ValueState<string>;
  /** Instance name most recently applied to the pane. */
  named: ValueState<string>;
  /** Interval that refreshes the published record. */
  timer: ValueState<ReturnType<typeof setInterval>>;
  /** Terminal input listener that marks pasted images as history. */
  removeInputListener: ValueState<() => void>;
  /** Publication in flight, if any. */
  publishing: ValueState<Promise<void>>;
}
