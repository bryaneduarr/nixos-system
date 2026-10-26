/** Overlay placement and size of the prompt browser. */
export interface PromptOverlayOptions {
  /** Marks that the browser is shown as an overlay. */
  readonly overlay: true;
  /** Placement and size of the overlay. */
  readonly overlayOptions: {
    /** Anchor position of the overlay. */
    readonly anchor: "center";
    /** Width of the overlay as a share of the terminal. */
    readonly width: `${number}%`;
    /** Maximum height of the overlay as a share of the terminal. */
    readonly maxHeight: `${number}%`;
    /** Margin around the overlay in cells. */
    readonly margin: number;
  };
}
