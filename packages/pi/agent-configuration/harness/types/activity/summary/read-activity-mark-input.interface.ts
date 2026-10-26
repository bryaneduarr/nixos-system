/** Fields that decide the mark shown before the latest activity text. */
export interface ReadActivityMarkInput {
  /** Whether the agent is working. */
  readonly working: boolean;
  /** Whether the running tool lines are expanded. */
  readonly expanded: boolean;
  /** Number of tools that are running. */
  readonly runningCount: number;
  /** Spinner frame counter. */
  readonly frame: number;
}
