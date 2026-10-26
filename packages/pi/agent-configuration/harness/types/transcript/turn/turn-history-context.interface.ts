import type { SplitViewTheme } from "../../split-view/split-view-theme.interface.ts";
import type { TranscriptRefreshUi } from "./transcript-refresh-ui.interface.ts";

/** Session state the turn history reads from an event or shortcut. */
export interface TurnHistoryContext {
  /** Current run mode such as tui or rpc. */
  readonly mode: string;
  /** Interface operations and colors. */
  readonly ui: TranscriptRefreshUi & {
    /** Colors of the current theme. */
    readonly theme: Pick<SplitViewTheme, "fg">;
  };
}
