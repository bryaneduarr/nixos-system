/** Fields that record an error or warning notice that appeared in the transcript. */
export interface RecordNoticeInput {
  /** Identifier of the recorded entry. */
  readonly id: string;
  /** Text of the error or warning. */
  readonly message: string;
  /** Working directory the notice appeared in. */
  readonly cwd: string;
  /** Time the notice appeared, in milliseconds since the epoch. */
  readonly occurredAt: number;
}
