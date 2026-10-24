/** Usage of one model across the scanned sessions. */
export interface ModelStats {
  /** Assistant turns the model produced. */
  turns: number;
  /** Tool calls the model made. */
  toolCalls: number;
  /** Prompt tokens across turns, cached and uncached. */
  promptTokens: number;
  /** Prompt tokens read from cache. */
  cacheReadTokens: number;
  /** Largest prompt of a single turn. */
  largestPromptTokens: number;
  /** Cost in dollars. */
  cost: number;
  /** Tool results that reported an error. */
  toolErrors: number;
  /** Run calls whose command started with cd. */
  cdPrefixedRuns: number;
}

/** Usage across the sessions modified within the scanned period. */
export interface SessionStats {
  /** Session files scanned. */
  readonly sessions: number;
  /** Compactions recorded in those sessions. */
  readonly compactions: number;
  /** Usage by provider/model. */
  readonly models: ReadonlyMap<string, ModelStats>;
  /** Tool calls by tool name. */
  readonly tools: ReadonlyMap<string, number>;
}
