import type { SplitViewTheme } from "../../split-view/split-view-theme.interface.ts";
import type { PromptBrowserHost } from "./prompt-browser-host.interface.ts";
import type { PromptOverlayOptions } from "./prompt-overlay-options.interface.ts";
import type { PromptPanel } from "./prompt-panel.interface.ts";

/** Creates the panel shown in a custom overlay. Pi passes keybindings as the third argument. */
export type PromptBrowserFactory<T> = (
  host: PromptBrowserHost,
  theme: SplitViewTheme,
  keybindings: object,
  done: (result: T) => void,
) => PromptPanel;

/** Shows custom panels to the user. */
export interface PromptViewerUi {
  /** Shows a panel from the factory and resolves when it is closed. */
  custom<T>(factory: PromptBrowserFactory<T>, options: PromptOverlayOptions): Promise<T>;
}
