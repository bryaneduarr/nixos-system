/** A source location matched by a search. */
export interface SearchMatch {
  /** Path of the matching file. */
  readonly file: string;
  /** One-based line number of the match. */
  readonly line: number;
  /** Text of the matching line. */
  readonly text: string;
}
