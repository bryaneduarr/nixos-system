import type { TerminalStream } from "./terminal-settings.interface.ts";

/** Inputs for redrawing usage cards in place on each refresh until the user quits. */
export interface WatchUsageInput {
  /** Reads and renders the cards text for one refresh; rejects when that refresh fails. */
  readonly loadCards: () => Promise<string>;
  /** Stream the cards are drawn on. */
  readonly stdout: TerminalStream;
  /** Stream the loading spinner is drawn on during the first refresh. */
  readonly stderr: TerminalStream;
  /** Waits for the given number of milliseconds between refreshes. */
  readonly wait: (milliseconds: number) => Promise<void>;
  /** Resolves when the user asks to quit. */
  readonly quitRequested: Promise<void>;
  /** Line drawn under the cards, already styled for the terminal. */
  readonly footerLine: string;
  /** Line drawn under the last cards when a refresh fails, already styled for the terminal. */
  readonly failedFooterLine: string;
}
