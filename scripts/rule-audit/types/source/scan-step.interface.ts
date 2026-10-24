/** What one scanning step writes and how many characters it consumed. */
export interface ScanStep {
  /** Text written in place of the consumed characters. */
  readonly replacement: string;
  /** Number of source characters consumed. */
  readonly consumed: number;
}
