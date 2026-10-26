/** Output stream the CLI writes to, reduced to what terminal decisions and drawing read. */
export interface TerminalStream {
  /** Whether the stream is attached to an interactive terminal. */
  readonly isTTY: boolean;
  /** Width in columns; a stream that is not a terminal reports no width at runtime. */
  readonly columns: number;
  /** Writes text to the stream. */
  write(text: string): void;
}

/** Inputs that decide colors and card width for this run. */
export interface TerminalSettingsInput {
  /** Process environment, read for NO_COLOR. */
  readonly environment: typeof process.env;
  /** Stream the usage output is written to. */
  readonly stdout: TerminalStream;
}

/** Display choices derived from the environment and the output terminal. */
export interface TerminalSettings {
  /** Whether ANSI color escapes may be written. */
  readonly colorEnabled: boolean;
  /** Card width in terminal columns. */
  readonly width: number;
}
