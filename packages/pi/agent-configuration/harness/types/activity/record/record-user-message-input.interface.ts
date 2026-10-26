/** Fields that record a message the user sent. */
export interface RecordUserMessageInput {
  /** Identifier of the recorded entry. */
  readonly id: string;
  /** Raw content of the user message as Pi delivered it. */
  readonly content: unknown;
  /** Working directory the message was sent in. */
  readonly cwd: string;
  /** Time the message was sent, in milliseconds since the epoch. */
  readonly startedAt: number;
}
