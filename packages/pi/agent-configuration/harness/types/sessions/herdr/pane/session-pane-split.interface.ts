import type { SessionCreation } from "./session-creation.interface.ts";

/** A session creation whose identity token and instance name are already reserved. */
export interface SessionPaneSplit extends SessionCreation {
  /** Identity token that the new session receives and registers under. */
  readonly token: string;
  /** Instance name reserved for the new session. */
  readonly name: string;
}
