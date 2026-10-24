/** Identity and timing of one entry recorded for a finished assistant message. */
export interface RecordTurnPartInput {
  /** Identifier of the recorded entry. */
  readonly id: string;
  /** Working directory the message ran in. */
  readonly cwd: string;
  /** Time the message started, in milliseconds since the epoch. */
  readonly startedAt: number;
  /** Time the message ended, in milliseconds since the epoch. */
  readonly endedAt: number;
}
