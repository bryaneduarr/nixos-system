import type { PromptNavigation } from "../navigation/prompt-navigation.interface.ts";
import type { ClipboardWriter } from "./clipboard-writer.interface.ts";

/** Text to copy from the prompt browser and the state the copy may clear afterwards. */
export interface CopyPromptTextInput {
  /** Text written to the clipboard. */
  readonly text: string;
  /** Writes text to the system clipboard. */
  readonly clipboard: ClipboardWriter;
  /** Navigation of the item shown now, which may change while the copy runs. */
  readonly currentNavigation: () => PromptNavigation;
}
