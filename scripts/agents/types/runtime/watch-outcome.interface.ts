/** Outcome of a watch step that was cut short because the user asked to quit. */
export interface QuitOutcome {
  /** Discriminator identifying a quit request. */
  readonly state: "quit";
}

/** Outcome of a refresh that produced cards. */
interface CardsLoadedOutcome {
  /** Discriminator identifying a loaded refresh. */
  readonly state: "loaded";
  /** Rendered cards text for the refresh. */
  readonly cards: string;
}

/** Outcome of a refresh that failed, so the cards already on screen stay. */
interface CardsFailedOutcome {
  /** Discriminator identifying a failed refresh. */
  readonly state: "failed";
}

/** Outcome of the wait between refreshes once it has elapsed. */
interface WaitElapsedOutcome {
  /** Discriminator identifying an elapsed wait. */
  readonly state: "elapsed";
}

/** Outcome of loading cards, or quitting before the load finished. */
export type CardsLoadOutcome = CardsLoadedOutcome | CardsFailedOutcome | QuitOutcome;

/** Outcome of waiting for the next refresh, or quitting before the wait elapsed. */
export type RefreshPauseOutcome = WaitElapsedOutcome | QuitOutcome;
