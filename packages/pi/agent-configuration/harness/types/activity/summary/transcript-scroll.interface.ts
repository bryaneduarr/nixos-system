/** Scroll position of the transcript that the activity summary sits below. */
export interface TranscriptScroll {
  /** Whether the transcript is scrolled away from its latest message. */
  isAwayFromLatest(): boolean;
}
