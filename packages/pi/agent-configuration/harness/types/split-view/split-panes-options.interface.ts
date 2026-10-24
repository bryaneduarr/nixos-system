import type { SplitViewFocus } from "./split-view-focus.interface.ts";
import type { SplitViewGeometry } from "./split-view-geometry.interface.ts";
import type { SplitViewTheme } from "./split-view-theme.interface.ts";

/** Rendered list and detail lines to place side by side or stacked. */
export interface SplitPanesOptions {
  /** Lines of the list pane, at most one per list row. */
  readonly list: readonly string[];
  /** Lines of the detail pane, at most one per detail row. */
  readonly detail: readonly string[];
  /** Pane sizes for this frame. */
  readonly geometry: SplitViewGeometry;
  /** Pane that has keyboard focus, shown by the divider color. */
  readonly focus: SplitViewFocus;
  /** Theme used for borders and titles. */
  readonly theme: SplitViewTheme;
}
