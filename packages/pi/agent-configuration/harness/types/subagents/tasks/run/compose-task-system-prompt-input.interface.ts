/** Inputs for the system prompt a subagent session runs with. */
export interface ComposeTaskSystemPromptInput {
  /** Provider of the subagent model. */
  readonly provider: string;
  /** System prompt of the parent session. */
  readonly parentPrompt: string;
  /** Role instructions for the subagent. */
  readonly rolePrompt: string;
}
