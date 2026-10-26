import type { PromptSelection } from "../collection/prompt-selection.interface.ts";
import type { ClipboardWriter } from "../input/clipboard-writer.interface.ts";
import type { PromptCollections } from "./prompt-collections.interface.ts";
import type { PromptViewerUi } from "./prompt-viewer-ui.interface.ts";

/** What the prompt browser overlay needs to open. */
export interface ViewPromptRequest {
  /** Interface that shows the overlay. */
  readonly ui: PromptViewerUi;
  /** Items of every list the browser can show. */
  readonly collections: PromptCollections;
  /** Writes copied text to the clipboard. */
  readonly clipboard: ClipboardWriter;
  /** What choosing an item in the browser does. */
  readonly selection: PromptSelection;
}
