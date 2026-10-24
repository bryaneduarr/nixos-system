import type { SessionRegistry } from "../../registry/row/session-registry.interface.ts";
import type { HerdrCommand } from "../command/herdr-command.interface.ts";
import type { PaneIdentity } from "./pane-identity.interface.ts";

/** Inputs that create a Pi session in a sibling pane of the caller. */
export interface SessionCreation {
  /** Runs Herdr commands for the socket scope. */
  readonly command: HerdrCommand;
  /** Registry that the new session must register in. */
  readonly registry: SessionRegistry;
  /** Project directory in which the new session starts. */
  readonly cwd: string;
  /** Pane that the new sibling pane is split from. */
  readonly source: PaneIdentity;
}
