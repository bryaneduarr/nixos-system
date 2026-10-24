/** One user-perceived character of a prompt with its UTF-16 offsets. */
export interface Grapheme {
  /** Text of the grapheme cluster. */
  readonly text: string;
  /** Offset of the first code unit of the cluster. */
  readonly start: number;
  /** Offset just past the last code unit of the cluster. */
  readonly end: number;
}
