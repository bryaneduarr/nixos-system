/** A prompt or output that belongs to a turn of the transcript. */
interface TranscriptPromptTurn {
  /** Marks an item that belongs to a turn. */
  readonly kind: "turn";
  /** How many turns before the latest turn the item belongs to; 0 is the latest turn. */
  readonly turnsFromLatest: number;
}

/** The unsent draft, which belongs to no turn yet. */
interface DraftPromptTurn {
  /** Marks the unsent draft. */
  readonly kind: "draft";
}

/** The turn an item of the prompt browser belongs to. */
export type PromptTurn = TranscriptPromptTurn | DraftPromptTurn;
