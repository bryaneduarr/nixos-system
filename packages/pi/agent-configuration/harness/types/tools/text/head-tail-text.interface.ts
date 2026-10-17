/** Text reduced to its first and last lines with a marker in between. */
export interface HeadTailText {
  /** The reduced text including the omission marker. */
  readonly text: string;
  /** Number of lines replaced by the marker. */
  readonly omittedLines: number;
}
