/** Fields that restore one tool result from session history. */
export interface HydrateToolResultInput {
  /** Identifier of the tool call the result answers. */
  readonly id: string;
  /** Raw tool result message as stored in the session. */
  readonly message: Readonly<Record<string, unknown>>;
  /** Working directory the tool ran in. */
  readonly cwd: string;
  /** Time the result was written, in milliseconds since the epoch. */
  readonly startedAt: number;
}
