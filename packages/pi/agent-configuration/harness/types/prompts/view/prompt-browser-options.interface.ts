import type { SplitViewTheme } from "../../split-view/split-view-theme.interface.ts";
import type { PromptSelection } from "../collection/prompt-selection.interface.ts";
import type { ClipboardWriter } from "../input/clipboard-writer.interface.ts";
import type { PromptBrowserHost } from "./prompt-browser-host.interface.ts";
import type { PromptCollections } from "./prompt-collections.interface.ts";

/** What the prompt browser needs to run. */
export interface PromptBrowserOptions {
  /** Items of every list the browser can show. */
  readonly collections: PromptCollections;
  /** Terminal host the browser reads its size from and asks to redraw. */
  readonly host: PromptBrowserHost;
  /** Colors applied to the browser. */
  readonly theme: SplitViewTheme;
  /** Closes the browser. */
  readonly done: () => void;
  /** Writes copied text to the clipboard. */
  readonly clipboard: ClipboardWriter;
  /** What choosing an item in the browser does. */
  readonly selection: PromptSelection;
}
