import type { LiveSession } from "../registry/row/live-session.interface.ts";
import type { PaneIdentity } from "./pane/pane-identity.interface.ts";
import type { SessionReportSource } from "./pane/session-report-source.interface.ts";

/** Herdr operations that keep a Pi session pane reported, named, focused, and created. */
export interface HerdrSessions {
  /** Returns the pane that hosts the calling Pi process. */
  readonly current: () => Promise<PaneIdentity>;
  /** Reports the session state and conversation reference of a pane. */
  readonly report: (row: LiveSession, source: SessionReportSource) => Promise<void>;
  /** Shows a completion notification for an instance name. */
  readonly notifyCompletion: (name: string) => Promise<void>;
  /** Releases the agent reporting of a pane. */
  readonly release: (row: LiveSession) => Promise<void>;
  /** Focuses the pane of a live session after checking it still hosts that session. */
  readonly focus: (row: LiveSession) => Promise<void>;
  /** Renames a pane and its agent, returning false while agent launch is pending. */
  readonly name: (location: PaneIdentity, name: string) => Promise<boolean>;
  /** Starts a new Pi session in a sibling pane of the source pane. */
  readonly create: (cwd: string, source: PaneIdentity) => Promise<void>;
}
