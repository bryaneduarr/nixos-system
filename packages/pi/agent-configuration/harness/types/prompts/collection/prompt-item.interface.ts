import type { PromptTurn } from "./prompt-turn.interface.ts";

/** A user prompt, the unsent draft, or an agent output listed by the prompt browser. */
export interface PromptItem {
  /** Full text of the prompt. */
  readonly text: string;
  /** Short list label, such as a sequence number or Draft. */
  readonly label: string;
  /** Turn of the transcript the item belongs to. */
  readonly turn: PromptTurn;
}
