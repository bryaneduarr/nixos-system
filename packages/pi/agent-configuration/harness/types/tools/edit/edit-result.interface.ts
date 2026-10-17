/** Outcome of an edit request. */
export interface EditResult {
  /** Message to return to the model, including the diff summary when changed. */
  readonly summary: string;
  /** Whether the file system was changed. */
  readonly changed: boolean;
}
