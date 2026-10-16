/** Text cut to a line and character limit. */
export interface ClampedText {
  /** The text that remains after clamping. */
  readonly text: string;
  /** Number of lines removed from the end. */
  readonly omittedLines: number;
  /** Whether any line or character was removed. */
  readonly truncated: boolean;
}
