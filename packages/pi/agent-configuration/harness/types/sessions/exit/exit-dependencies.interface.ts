import type { CleanupCancellation } from "../cleanup/worker/cleanup-cancellation.interface.ts";
import type { HerdrCommand } from "../herdr/command/herdr-command.interface.ts";
import type { ExitTarget } from "./exit-target.interface.ts";

/** External effects of an explicit exit, replaceable in tests. */
export interface ExitDependencies {
  /** Creates the Herdr command runner for a socket. */
  readonly command: (socket: string) => HerdrCommand;
  /** Schedules the cleanup worker for an explicit exit and returns how to cancel it. */
  readonly schedule: (target: ExitTarget) => Promise<CleanupCancellation>;
}
