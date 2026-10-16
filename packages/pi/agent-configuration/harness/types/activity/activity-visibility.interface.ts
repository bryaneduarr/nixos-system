/** Tracks whether tool history is shown in the transcript. */
export interface ActivityVisibility {
  /** Clears the agent-working state and every manual override. */
  reset(): void;
  /** Records whether the primary agent is working. */
  setAgentWorking(working: boolean): void;
  /** Whether tool history is currently shown. */
  isVisible(): boolean;
  /** Flips the visibility for the current agent state. */
  toggle(): void;
}
