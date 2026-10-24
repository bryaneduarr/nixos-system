/** Text and state that the header line of the activity summary shows. */
export interface SummaryHeaderParts {
  /** Width available to the summary, in terminal columns. */
  readonly width: number;
  /** Label of the toggle that shows or hides tool history. */
  readonly leading: string;
  /** Count, duration, and details label shown on the right of the header. */
  readonly trailing: string;
  /** Spinner or status mark followed by the latest activity text. */
  readonly activity: string;
  /** Whether the header and its footer use two lines. */
  readonly twoLines: boolean;
}
