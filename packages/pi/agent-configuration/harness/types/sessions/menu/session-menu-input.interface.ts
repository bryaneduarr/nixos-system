import type { Theme } from "@earendil-works/pi-coding-agent";
import type { TUI } from "@earendil-works/pi-tui";
import type { SessionRegistry } from "../registry/session-registry.interface.ts";
import type { MenuSelection } from "./menu-selection.interface.ts";

/* Terminal, theme, and registry that the session menu renders and reads from. */
export interface SessionMenuInput {
  /* Terminal UI that schedules renders and reports the terminal size. */
  readonly tui: TUI;
  /* Theme that colors the menu lines. */
  readonly theme: Theme;
  /* Registry whose live sessions the menu lists. */
  readonly registry: SessionRegistry;
  /* Closes the menu with the chosen session, a new-session request, or a cancellation. */
  readonly done: (selection: MenuSelection) => void;
}
