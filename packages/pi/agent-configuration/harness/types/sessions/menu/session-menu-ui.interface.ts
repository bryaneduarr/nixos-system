import type { ExtensionUIContext } from "@earendil-works/pi-coding-agent";
import type { KeybindingsManager } from "@earendil-works/pi-tui";
import type { MenuSelection } from "./menu-selection.interface.ts";
import type { SessionMenuComponent } from "./session-menu-component.interface.ts";
import type { SessionMenuTerminal } from "./session-menu-terminal.interface.ts";
import type { SessionMenuTheme } from "./session-menu-theme.interface.ts";

/** Pi interface that shows the session menu as an overlay. */
export interface SessionMenuUi {
  /** Shows the menu component and resolves with the selection that closes it. */
  readonly custom: (
    factory: (
      tui: SessionMenuTerminal,
      theme: SessionMenuTheme,
      keybindings: KeybindingsManager,
      done: (selection: MenuSelection) => void,
    ) => SessionMenuComponent,
    options: NonNullable<Parameters<ExtensionUIContext["custom"]>[1]>,
  ) => Promise<MenuSelection>;
}
