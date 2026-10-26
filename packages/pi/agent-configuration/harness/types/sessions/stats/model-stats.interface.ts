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
