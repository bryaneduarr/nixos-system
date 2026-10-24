import type { Theme } from "@earendil-works/pi-coding-agent";
import type { TUI } from "@earendil-works/pi-tui";
import type { InspectorSelection } from "./inspector-selection.interface.ts";

/** Inputs for creating the inspector overlay component. */
export interface InspectorOptions {
  /** Terminal UI that renders the overlay. */
  readonly tui: TUI;
  /** Theme used for colors and emphasis. */
  readonly theme: Theme;
  /** Closes the overlay. */
  readonly done: () => void;
  /** Row selected when the overlay opens. */
  readonly selection: InspectorSelection;
}
