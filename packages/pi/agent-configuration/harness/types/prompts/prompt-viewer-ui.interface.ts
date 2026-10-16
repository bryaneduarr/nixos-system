import type { PromptBrowserHost } from "./prompt-browser-host.interface.ts";
import type { PromptPanel } from "./prompt-panel.interface.ts";
import type { PromptTheme } from "./prompt-theme.interface.ts";

/* Overlay placement and size of the prompt browser. */
export interface PromptOverlayOptions {
  /* Marks that the browser is shown as an overlay. */
  readonly overlay: true;
  /* Placement and size of the overlay. */
  readonly overlayOptions: {
    /* Anchor position of the overlay. */
    readonly anchor: "center";
    /* Width of the overlay as a share of the terminal. */
    readonly width: `${number}%`;
    /* Maximum height of the overlay as a share of the terminal. */
    readonly maxHeight: `${number}%`;
    /* Margin around the overlay in cells. */
    readonly margin: number;
  };
}

/* Creates the panel shown in a custom overlay. Pi passes keybindings as the third argument. */
export type PromptBrowserFactory<T> = (
  host: PromptBrowserHost,
  theme: PromptTheme,
  keybindings: object,
  done: (result: T) => void,
) => PromptPanel;

/* Shows custom panels to the user. */
export interface PromptViewerUi {
  /* Shows a panel from the factory and resolves when it is closed. */
  custom<T>(factory: PromptBrowserFactory<T>, options: PromptOverlayOptions): Promise<T>;
}
