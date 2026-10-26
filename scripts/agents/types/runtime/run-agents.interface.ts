import type { KeyInput, SignalSource } from "./quit-listener.interface.ts";
import type { TerminalStream } from "./terminal-settings.interface.ts";
import type { ReadUsageSnapshot } from "./usage-snapshot.interface.ts";

/** Process facts and adapters the agents command runs with, injected so tests never touch real processes. */
export interface RunAgentsInput {
  /** Command line arguments after the program name. */
  readonly argv: readonly string[];
  /** Process environment, read for NO_COLOR. */
  readonly environment: typeof process.env;
  /** Standard input, switched to raw mode while watching. */
  readonly stdin: KeyInput;
  /** Stream help and usage output is written to. */
  readonly stdout: TerminalStream;
  /** Stream errors and the loading spinner are written to. */
  readonly stderr: TerminalStream;
  /** Process signals that stop watching. */
  readonly signals: SignalSource;
  /** Waits between watch refreshes; the entry passes a real timer. */
  readonly wait: (milliseconds: number) => Promise<void>;
  /** Reads provider usage; the entry passes the real providers. */
  readonly readUsageSnapshot: ReadUsageSnapshot;
}
