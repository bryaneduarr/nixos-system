import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { LiveSession } from "../registry/row/live-session.interface.ts";
import type { MonitoredSession } from "./monitored-session.interface.ts";

/** A published live record that may need a new Herdr state report. */
export interface SessionReport {
  /** Session being published. */
  readonly session: MonitoredSession;
  /** Live record just built for the session. */
  readonly row: LiveSession;
  /** Latest Pi context of the session. */
  readonly ctx: ExtensionContext;
}
