/** Urgency band of a usage bar, chosen from the percent remaining. */
export type BarLevel = "green" | "yellow" | "red";

/** Inputs for drawing one usage bar. */
export interface UsageBarInput {
  /** Whole percent of the window still available, from 0 when exhausted to 100 when untouched. */
  readonly percent: number;
  /** Whether ANSI color escapes may be written. */
  readonly colorEnabled: boolean;
}
