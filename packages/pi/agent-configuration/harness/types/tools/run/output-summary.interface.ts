/** Summary of error lines found in command output. */
export type OutputSummary = FoundOutputSummary | MissingOutputSummary;

/** Output that contains error lines. */
interface FoundOutputSummary {
  /** Marks output with error lines. */
  readonly found: true;
  /** Counts of error lines, such as "TypeScript errors: 2". */
  readonly text: string;
}

/** Output without recognizable error lines. */
interface MissingOutputSummary {
  /** Marks output without error lines. */
  readonly found: false;
}
