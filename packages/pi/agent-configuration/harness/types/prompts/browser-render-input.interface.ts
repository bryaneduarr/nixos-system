import type { BrowserLayout } from "./browser-layout.interface.ts";
import type { DisplayRow } from "./display-row.interface.ts";
import type { PromptFocus } from "./prompt-focus.interface.ts";
import type { PromptNavigation } from "./prompt-navigation.interface.ts";
import type { PromptTheme } from "./prompt-theme.interface.ts";

/* Browser state needed to draw one frame of the prompt browser. */
export interface BrowserRenderInput {
  /* Columns inside the frame. */
  readonly columns: number;
  /* Pane sizes computed for the current terminal. */
  readonly layout: BrowserLayout;
  /* Wrapped rows of the displayed prompt. */
  readonly rows: readonly DisplayRow[];
  /* Index of the first wrapped row shown in the detail pane. */
  readonly offset: number;
  /* Cursor and selection state of the displayed prompt. */
  readonly navigation: PromptNavigation;
  /* Pane that receives keyboard input. */
  readonly focus: PromptFocus;
  /* Index of the selected prompt in the list. */
  readonly selected: number;
  /* One-line summaries of every prompt in the list. */
  readonly summaries: readonly string[];
  /* Status message shown in the footer, empty to show the key hint. */
  readonly status: string;
  /* Colors applied to the frame. */
  readonly theme: PromptTheme;
}
