import type { LiveSession } from "./live-session.interface.ts";

/** Shared directory of live session records, name reservations, and history markers. */
export interface SessionRegistry {
  /** Directory that holds the registry files of one Herdr socket scope. */
  readonly directory: string;
  /** Writes the live record of a session and its project marker. */
  readonly publish: (row: LiveSession) => Promise<void>;
  /** Reserves and returns the instance name of a session. */
  readonly instanceName: (cwd: string, identity: string) => Promise<string>;
  /** Records that a conversation has user or agent history. */
  readonly markUsed: (identity: string) => Promise<void>;
  /** Whether a conversation has recorded history, or cannot be checked. */
  readonly hasHistory: (identity: string) => Promise<boolean>;
  /** Removes the live record and, unless preserved, the name reservation. */
  readonly remove: (identity: string, preserveName: boolean) => Promise<void>;
  /** Lists live sessions sorted by directory and name. */
  readonly list: () => Promise<readonly LiveSession[]>;
  /** Lists canonical project directories that have live or past sessions. */
  readonly projects: () => Promise<readonly string[]>;
}
