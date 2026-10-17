/** Callbacks that connect the navigation state to the rendered overlay. */
export interface InspectorNavigationOptions {
  /** Body height in terminal rows, used for page moves. */
  readonly bodyHeight: () => number;
  /** Number of detail lines of the selected row, used to bound scrolling. */
  readonly detailLength: () => number;
  /** Requests a redraw after the state changes. */
  readonly changed: () => void;
}
