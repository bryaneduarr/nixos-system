/** Thinking and response text of the primary agent's current turn. */
export interface AssistantTextPatch {
  /** Thinking text streamed so far. */
  readonly thinking: string;
  /** Whether the provider redacted the thinking text. */
  readonly thinkingRedacted: boolean;
  /** Response text streamed so far. */
  readonly response: string;
  /** Time of the change, in milliseconds since the epoch. */
  readonly updatedAt: number;
}
