/** One exact text replacement. */
export interface TextEdit {
  /** Exact text to find. */
  readonly oldText: string;
  /** Text that replaces it. */
  readonly newText: string;
}
