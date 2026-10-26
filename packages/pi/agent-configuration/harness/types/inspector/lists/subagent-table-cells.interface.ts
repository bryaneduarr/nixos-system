/** Text of each cell in one row of the subagents table. */
export interface SubagentTableCells {
  /** Position of the subagent in the session. */
  readonly number: string;
  /** Lifecycle state of the subagent. */
  readonly status: string;
  /** Time the subagent has been running or ran. */
  readonly time: string;
  /** Context tokens in use against the model's context window. */
  readonly context: string;
  /** Tokens the subagent has spent in total. */
  readonly spent: string;
  /** Model the subagent runs on. */
  readonly model: string;
  /** Reasoning level the subagent runs with. */
  readonly reasoning: string;
}
