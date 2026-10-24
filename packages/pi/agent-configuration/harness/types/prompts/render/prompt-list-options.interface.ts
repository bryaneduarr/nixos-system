import type { SplitViewGeometry } from "../../split-view/split-view-geometry.interface.ts";
import type { SplitViewTheme } from "../../split-view/split-view-theme.interface.ts";

/** What the prompt list pane needs to draw one frame. */
export interface PromptListOptions {
  /** One-line summaries of every item in the shown list. */
  readonly summaries: readonly string[];
  /** Index of the selected item in the list. */
  readonly selected: number;
  /** Pane sizes computed for the current terminal. */
  readonly geometry: SplitViewGeometry;
  /** Colors applied to the rows. */
  readonly theme: SplitViewTheme;
}
