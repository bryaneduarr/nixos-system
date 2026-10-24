import type { HerdrCommand } from "../../herdr/command/herdr-command.interface.ts";

/** External effects of closing a pane after a process exits, replaceable in tests. */
export interface PaneCloseDependencies {
  /** Runs Herdr commands for the socket scope. */
  readonly command: HerdrCommand;
  /** Reads the boot and start-time identity of a process. */
  readonly identity: (pid: number) => Promise<string>;
  /** Pauses between polls for the given milliseconds. */
  readonly wait: (milliseconds: number) => Promise<void>;
}
