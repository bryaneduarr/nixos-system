import type { SplitViewTheme } from "../../split-view/split-view-theme.interface.ts";
import type { DisplayRow } from "../display/display-row.interface.ts";
import type { PromptNavigation } from "../navigation/prompt-navigation.interface.ts";

/** What one wrapped row of the prompt detail pane needs to be drawn. */
export interface PromptRowOptions {
  /** Cells of the wrapped row. */
  readonly row: DisplayRow;
  /** Cursor and selection state of the displayed item. */
  readonly navigation: PromptNavigation;
  /** Whether the detail pane has keyboard focus and shows the cursor. */
  readonly focused: boolean;
  /** Colors applied to the cursor and selection. */
  readonly theme: SplitViewTheme;
}
