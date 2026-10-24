import type { TUI } from "@earendil-works/pi-tui";

/** Terminal UI that the session menu renders into and reads the terminal size from. */
export interface SessionMenuTerminal {
  /** Terminal whose size bounds the menu. */
  readonly terminal: { readonly rows: number };
  /** Schedules a render of the menu. */
  readonly requestRender: TUI["requestRender"];
}
