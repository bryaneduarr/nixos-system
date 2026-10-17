import type { InspectorRow } from "../detail/inspector-row.interface.ts";

/** Geometry of the list and detail panes in the last rendered frame. */
interface InspectorLayout {
  /** Width of the list pane in columns. */
  readonly leftWidth: number;
  /** Terminal row of the first body line. */
  readonly bodyTop: number;
  /** Terminal rows occupied by the body. */
  readonly bodyHeight: number;
  /** Terminal rows occupied by the tool list. */
  readonly listHeight: number;
  /** Whether the list and detail panes sit side by side. */
  readonly twoPane: boolean;
  /** Rows listed in the frame. */
  readonly rows: readonly InspectorRow[];
}

/** A rendered frame that has a tool list to hit test. */
interface LaidOutInspector {
  /** Discriminates a frame with a list layout. */
  readonly kind: "laid-out";
  /** Geometry of the rendered panes. */
  readonly layout: InspectorLayout;
}

/** A rendered frame without a tool list, such as an empty page. */
interface NoInspectorLayout {
  /** Discriminates a frame without a list layout. */
  readonly kind: "none";
}

/** Layout state of the last rendered frame. */
export type InspectorLayoutState = LaidOutInspector | NoInspectorLayout;
