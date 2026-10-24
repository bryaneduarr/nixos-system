import type { TranscriptRefreshUi } from "./transcript-refresh-ui.interface.ts";
import type { TurnDividerTheme } from "./turn-divider.interface.ts";

/** Session state the turn history reads from an event or shortcut. */
export interface TurnHistoryContext {
  /** Current run mode such as tui or rpc. */
  readonly mode: string;
  /** Interface operations and colors. */
  readonly ui: TranscriptRefreshUi & {
    /** Colors of the current theme. */
    readonly theme: TurnDividerTheme;
  };
}

/** Extension registration operations the turn history installs. */
export interface TurnHistoryApi {
  /** Starts a session in the context. */
  on(event: "session_start", handler: (event: unknown, ctx: TurnHistoryContext) => void): void;
  /** Receives user input before the agent processes it. */
  on(event: "input", handler: () => { readonly action: "continue" }): void;
  /** Ends the session. */
  on(event: "session_shutdown", handler: () => void): void;
  /** Registers a keyboard shortcut. */
  registerShortcut(
    key: string,
    options: { readonly description: string; readonly handler: (ctx: TurnHistoryContext) => void },
  ): void;
}
