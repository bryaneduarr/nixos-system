import type { LiveSession } from "../../registry/row/live-session.interface.ts";
import type { HerdrCommand } from "../command/herdr-command.interface.ts";
import type { SessionReportSource } from "./session-report-source.interface.ts";

/** Inputs that report the state of a session pane to Herdr. */
export interface SessionStateReport {
  /** Runs Herdr commands for the socket scope. */
  readonly command: HerdrCommand;
  /** Produces the next increasing report sequence. */
  readonly nextSequence: () => string;
  /** Live record whose state is reported. */
  readonly row: LiveSession;
  /** Conversation reference stored with the report. */
  readonly source: SessionReportSource;
}
