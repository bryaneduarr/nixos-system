import type { SessionRegistry } from "../../registry/row/session-registry.interface.ts";

/** A new session whose registration in the registry is awaited. */
export interface SessionRegistrationWait {
  /** Registry the new session must register in. */
  readonly registry: SessionRegistry;
  /** Identity token the new session registers under. */
  readonly token: string;
  /** Herdr pane identifier that hosts the new session. */
  readonly pane: string;
  /** Project directory in which the new session started. */
  readonly cwd: string;
}
