/** Sizes of the inspector body panes for one terminal width and height. */
export interface SplitViewGeometry {
  /** Body height in terminal rows. */
  readonly height: number;
  /** Whether the list and detail panes sit side by side. */
  readonly twoPane: boolean;
  /** Width available inside the frame in columns. */
  readonly contentWidth: number;
  /** Width of the list pane in columns. */
  readonly leftWidth: number;
  /** Width of the detail pane in columns. */
  readonly rightWidth: number;
  /** Rows of the tool list pane. */
  readonly listHeight: number;
  /** Rows of the detail pane. */
  readonly detailHeight: number;
}
