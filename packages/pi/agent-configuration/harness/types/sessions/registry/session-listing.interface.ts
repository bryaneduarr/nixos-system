import type { LiveSession } from "./live-session.interface.ts";

/** Live sessions that the session menu lists. */
export interface SessionListing {
  /** Lists live sessions sorted by directory and name. */
  list(): Promise<readonly LiveSession[]>;
}
