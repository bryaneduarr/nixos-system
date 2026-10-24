import type { SessionListing } from "../../registry/row/session-listing.interface.ts";
import type { MenuSelection } from "./menu-selection.interface.ts";
import type { SessionMenuTerminal } from "./session-menu-terminal.interface.ts";
import type { SessionMenuTheme } from "./session-menu-theme.interface.ts";

/** Terminal, theme, and registry that the session menu renders and reads from. */
export interface SessionMenuInput {
  /** Terminal UI that schedules renders and reports the terminal size. */
  readonly tui: SessionMenuTerminal;
  /** Theme that colors the menu lines. */
  readonly theme: SessionMenuTheme;
  /** Registry whose live sessions the menu lists. */
  readonly registry: SessionListing;
  /** Closes the menu with the chosen session, a new-session request, or a cancellation. */
  readonly done: (selection: MenuSelection) => void;
}
