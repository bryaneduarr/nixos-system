import type { PromptItem } from "./prompt-item.interface.ts";
import type { PromptSelection } from "./prompt-selection.interface.ts";

/** What choosing a turn from the prompt browser needs. */
export interface ChoosePromptTurnRequest {
  /** What Enter does in this browser. */
  readonly selection: PromptSelection;
  /** Items of the list shown. */
  readonly items: readonly PromptItem[];
  /** Index of the selected item in the list. */
  readonly selected: number;
  /** Closes the browser. */
  readonly done: () => void;
}
