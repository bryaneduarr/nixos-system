import type { DisplayRow } from "../display/display-row.interface.ts";
import type { PromptNavigation } from "../navigation/prompt-navigation.interface.ts";

/** Browser state that detail-pane key motions act on. */
export interface DetailKeyContext {
  /** Cursor and selection state of the displayed prompt. */
  readonly navigation: PromptNavigation;
  /** Wrapped rows of the displayed prompt at the current width. */
  rows(): readonly DisplayRow[];
  /** Wrapped rows shown on one detail page. */
  readonly pageSize: number;
  /** Copies text to the clipboard. */
  copy(text: string): void;
}
