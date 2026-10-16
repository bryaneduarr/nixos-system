import type { InspectorNavigation } from "../navigation/inspector-navigation.interface.ts";
import type { InspectorLayoutState } from "../view/inspector-layout.interface.ts";

/** Overlay state and actions that the keyboard and mouse input is built from. */
export interface InspectorInputContext {
  /** Navigation state that input moves. */
  readonly navigation: InspectorNavigation;
  /** Terminal row of the footer in the last rendered frame. */
  readonly footerY: number;
  /** Layout of the last rendered frame. */
  readonly layout: InspectorLayoutState;
  /** Current terminal height in rows, used for page moves. */
  readonly terminalRows: () => number;
  /** Closes the overlay. */
  readonly close: () => void;
  /** Requests a redraw of the overlay. */
  readonly requestRender: () => void;
  /** Shows a status message in the footer; an empty message clears it. */
  readonly setStatus: (message: string) => void;
  /** Copies the selected detail text. */
  readonly copy: () => void;
  /** Loads or unloads the artifact of the selected call. */
  readonly toggleArtifact: () => void;
}
