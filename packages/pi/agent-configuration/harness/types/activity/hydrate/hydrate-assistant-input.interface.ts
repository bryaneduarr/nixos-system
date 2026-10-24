/** Fields that restore the thinking, text, and tool calls of one assistant message from session history. */
export interface HydrateAssistantInput {
  /** Identifier of the session entry that holds the message. */
  readonly entryId: string;
  /** Raw message as stored in the session. */
  readonly message: Readonly<Record<string, unknown>>;
  /** Working directory the message ran in. */
  readonly cwd: string;
  /** Time the message was written, in milliseconds since the epoch. */
  readonly startedAt: number;
}
