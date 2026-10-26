import type { QUIT_SIGNALS } from "../../constants/runtime/quit-key.constant.ts";

/** Standard input reduced to what the quit listener reads and restores. */
export interface KeyInput {
  /** Whether standard input is an interactive terminal, the only case where raw mode applies. */
  readonly isTTY: boolean;
  /** Turns raw mode on or off, so each key arrives without waiting for Enter. */
  setRawMode(enabled: boolean): void;
  /** Decodes incoming bytes as text. */
  setEncoding(encoding: "utf8"): void;
  /** Adds a listener for chunks of key input. */
  on(event: "data", listener: (chunk: string) => void): void;
  /** Removes a listener added with `on`. */
  off(event: "data", listener: (chunk: string) => void): void;
  /** Starts delivering key input to listeners. */
  resume(): void;
  /** Stops delivering key input so the process can exit. */
  pause(): void;
}

/** Process signal that requests a quit. */
export type QuitSignal = (typeof QUIT_SIGNALS)[number];

/** Process signals reduced to adding and removing quit listeners. */
export interface SignalSource {
  /** Runs the listener when the signal arrives. */
  on(signal: QuitSignal, listener: () => void): void;
  /** Removes a listener added with `on`. */
  off(signal: QuitSignal, listener: () => void): void;
}

/** Inputs the quit listener watches for a quit request. */
export interface QuitListenerInput {
  /** Key input that carries the q and Ctrl-C keys. */
  readonly keys: KeyInput;
  /** Source of quit signals such as SIGINT, SIGTERM, and SIGHUP. */
  readonly signals: SignalSource;
}

/** Pending quit request and the cleanup that restores the terminal. */
export interface QuitListener {
  /** Resolves when the user presses q or Ctrl-C, or the process receives a quit signal. */
  readonly quitRequested: Promise<void>;
  /** Restores raw mode and removes every listener this listener added. */
  dispose(): void;
}
