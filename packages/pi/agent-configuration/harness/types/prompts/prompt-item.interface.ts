/** A user prompt or the unsent draft listed by the prompt browser. */
export interface PromptItem {
  /** Full text of the prompt. */
  readonly text: string;
  /** Short list label, such as a sequence number or Draft. */
  readonly label: string;
}
