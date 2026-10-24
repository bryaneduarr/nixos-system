import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import type { TranscriptRefreshUi } from "../../transcript/turn/transcript-refresh-ui.interface.ts";
import type { PromptViewerUi } from "../view/prompt-viewer-ui.interface.ts";

/** User interface operations the prompt browser uses. */
interface PromptContextUi extends PromptViewerUi, TranscriptRefreshUi {
  /** Shows a short informational message. */
  notify(message: string, level: "info"): void;
  /** Current text of the unsent editor draft. */
  getEditorText(): string;
}

/** Session and interface state the prompt browser reads from a command or shortcut. */
export interface PromptContext {
  /** Current run mode such as tui or rpc. */
  readonly mode: string;
  /** Session manager whose branch entries list the prompts. */
  readonly sessionManager: {
    /** Returns the entries of the current branch. */
    getBranch(): readonly SessionEntry[];
  };
  /** User interface operations. */
  readonly ui: PromptContextUi;
}
