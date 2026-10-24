/** Fields that record a text-only activity entry such as a thinking or update step. */
export interface RecordTextEntryInput {
  /** Identifier of the recorded entry. */
  readonly id: string;
  /** Text the entry shows. */
  readonly text: string;
  /** Working directory the message ran in. */
  readonly cwd: string;
  /** Time the entry started, in milliseconds since the epoch. */
  readonly startedAt: number;
}
