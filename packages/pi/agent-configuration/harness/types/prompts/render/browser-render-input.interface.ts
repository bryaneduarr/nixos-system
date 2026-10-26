import type { SplitViewFocus } from "../../split-view/split-view-focus.interface.ts";
import type { SplitViewGeometry } from "../../split-view/split-view-geometry.interface.ts";
import type { SplitViewTheme } from "../../split-view/split-view-theme.interface.ts";
import type { DisplayRow } from "../display/display-row.interface.ts";
import type { PromptNavigation } from "../navigation/prompt-navigation.interface.ts";
import type { PromptCollectionName } from "../view/prompt-collections.interface.ts";

/** Browser state needed to draw one frame of the prompt browser. */
export interface BrowserRenderInput {
  /** Width of the overlay in columns. */
  readonly columns: number;
  /** Pane sizes computed for the current terminal. */
  readonly geometry: SplitViewGeometry;
  /** Wrapped rows of the displayed item. */
  readonly rows: readonly DisplayRow[];
  /** Index of the first wrapped row shown in the detail pane. */
  readonly offset: number;
  /** Cursor and selection state of the displayed item. */
  readonly navigation: PromptNavigation;
  /** List shown: the user's prompts or the agent's outputs. */
  readonly collection: PromptCollectionName;
  /** Pane that receives keyboard input. */
  readonly focus: SplitViewFocus;
  /** Index of the selected item in the list. */
  readonly selected: number;
  /** One-line summaries of every item in the shown list. */
  readonly summaries: readonly string[];
  /** Key hint shown in the header. */
  readonly keyHint: string;
  /** Status message shown in the footer, empty when there is none. */
  readonly status: string;
  /** Colors applied to the frame. */
  readonly theme: SplitViewTheme;
}
