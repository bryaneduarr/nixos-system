/** Which turns of the transcript are shown. */
export interface TurnView {
  /** Whether only the focused turn is shown. */
  readonly hidden: boolean;
  /** How many turns before the latest one the focused turn is; 0 is the latest turn. */
  readonly turnsFromLatest: number;
}
