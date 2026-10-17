import type { Component } from "@earendil-works/pi-tui";

/** Overlay component of the session menu, which also stops its refresh timer when disposed. */
export interface SessionMenuComponent extends Component {
  /** Whether the filter input currently receives keys. */
  focused: boolean;
  /** Handles one terminal input sequence while the menu is open. */
  handleInput(data: string): void;
  /** Stops the registry refresh timer and marks the menu as closed. */
  dispose(): void;
}
