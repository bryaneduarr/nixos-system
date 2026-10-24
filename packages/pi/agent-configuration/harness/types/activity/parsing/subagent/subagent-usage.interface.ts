import type { ValueState } from "../../value/value-state.interface.ts";

/** Token and cost totals reported by a delegated worker. */
export interface SubagentUsage {
  /** Input tokens sent to the model. */
  inputTokens: number;
  /** Output tokens produced by the model. */
  outputTokens: number;
  /** Tokens read from the prompt cache. */
  cacheReadTokens: number;
  /** Tokens written to the prompt cache. */
  cacheWriteTokens: number;
  /** Tokens spent on reasoning. */
  reasoningTokens: number;
  /** Cumulative tokens spent across completed responses. */
  totalTokens: number;
  /** Token usage reported for the latest response or context. */
  contextTokens: ValueState<number>;
  /** Largest context usage observed in any response. */
  maxContextTokens: ValueState<number>;
}
