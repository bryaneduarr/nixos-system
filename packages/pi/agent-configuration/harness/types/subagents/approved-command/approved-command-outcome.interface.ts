/** Result of an approved command request, as reported back to the worker. */
export interface ApprovedCommandOutcome {
  /** Bounded output text the worker reads. */
  readonly text: string;
  /** Exit code of the command, or 126 when the command was not approved. */
  readonly exitCode: number;
  /** Whether the request was refused or failed. */
  readonly isError: boolean;
}
