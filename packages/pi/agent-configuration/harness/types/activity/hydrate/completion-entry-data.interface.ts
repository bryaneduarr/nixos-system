/** Data stored in a session entry when an agent turn completes. */
export interface CompletionEntryData {
  /** Ordinal of the user message whose turn completed. */
  readonly messageNumber: number;
  /** Time the turn completed, in milliseconds since the epoch. */
  readonly completedAt: number;
}
