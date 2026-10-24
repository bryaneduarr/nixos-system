/** The browser only shows and copies text. */
interface ReadOnlyPromptSelection {
  /** Marks the browser that does not choose turns. */
  readonly kind: "read-only";
}

/** The browser lets the user choose the turn the transcript shows. */
interface TurnPromptSelection {
  /** Marks the browser that chooses turns. */
  readonly kind: "choose-turn";
  /** Shows the turn this many turns before the latest one. */
  choose(turnsFromLatest: number): void;
}

/** What pressing Enter on an item of the prompt browser does. */
export type PromptSelection = ReadOnlyPromptSelection | TurnPromptSelection;
