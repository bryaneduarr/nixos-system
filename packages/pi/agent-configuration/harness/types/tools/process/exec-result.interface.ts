/** Outcome of a finished process. */
export interface ExecResult {
  /** Captured standard output. */
  readonly stdout: string;
  /** Captured standard error, including any spawn error message. */
  readonly stderr: string;
  /** Exit code; 124 when killed without a code and 127 when the program could not start. */
  readonly code: number;
  /** Whether the process was killed by a timeout or abort. */
  readonly killed: boolean;
  /** Whether the process was killed because it hit its timeout. */
  readonly timedOut: boolean;
}
