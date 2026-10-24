import type { ValueState } from "../../../activity/value/value-state.interface.ts";
import type { LiveSession } from "../../registry/row/live-session.interface.ts";
import type { SessionMenuTheme } from "./session-menu-theme.interface.ts";

/** Snapshot of the session menu that one render turns into terminal lines. */
export interface SessionMenuView {
  /** Width of the overlay in terminal columns. */
  readonly width: number;
  /** Height of the terminal in rows, which bounds the number of listed sessions. */
  readonly terminalRows: number;
  /** Theme that colors the menu lines. */
  readonly theme: SessionMenuTheme;
  /** Sessions that match the current filter, in display order. */
  readonly rows: readonly LiveSession[];
  /** Identity of the highlighted session, absent when no session is listed. */
  readonly selection: ValueState<string>;
  /** Process identifier of the running Pi process, which marks its own session. */
  readonly pid: number;
  /** Lines of the filter input, empty when the filter is hidden. */
  readonly filterLines: readonly string[];
  /** Last registry refresh error, absent when the last refresh succeeded. */
  readonly refreshError: ValueState<string>;
}
