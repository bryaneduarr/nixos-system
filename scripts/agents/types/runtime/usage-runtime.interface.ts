import type { KeyInput, SignalSource } from "./quit-listener.interface.ts";
import type { TerminalSettings, TerminalStream } from "./terminal-settings.interface.ts";
import type { ReadUsageSnapshot } from "./usage-snapshot.interface.ts";

/** Terminal and data access shared by the once and watch usage runs. */
export interface UsageRuntime {
  /** Reads colors and width of the output terminal, so each render uses the size in effect then. */
  readonly readSettings: () => TerminalSettings;
  /** Stream the usage output is written to. */
  readonly stdout: TerminalStream;
  /** Stream the loading spinner is drawn on. */
  readonly stderr: TerminalStream;
  /** Reads usage for the providers. */
  readonly readSnapshot: ReadUsageSnapshot;
}

/** Usage run that keeps refreshing, so it also reads keys and process signals. */
export interface WatchRuntime extends UsageRuntime {
  /** Standard input whose q and Ctrl-C keys stop watching. */
  readonly stdin: KeyInput;
  /** Process signals that stop watching. */
  readonly signals: SignalSource;
  /** Waits between watch refreshes. */
  readonly wait: (milliseconds: number) => Promise<void>;
}
