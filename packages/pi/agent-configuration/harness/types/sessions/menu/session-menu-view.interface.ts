import type { Theme } from "@earendil-works/pi-coding-agent";
import type { LiveSession } from "../registry/live-session.interface.ts";

/* Snapshot of the session menu that one render turns into terminal lines. */
export interface SessionMenuView {
  /* Width of the overlay in terminal columns. */
  readonly width: number;
  /* Height of the terminal in rows, which bounds the number of listed sessions. */
  readonly terminalRows: number;
  /* Theme that colors the menu lines. */
  readonly theme: Theme;
  /* Sessions that match the current filter, in display order. */
  readonly rows: readonly LiveSession[];
  /* Identity of the highlighted session. */
  readonly selectedId: string;
  /* Process identifier of the running Pi process, which marks its own session. */
  readonly pid: number;
  /* Lines of the filter input, empty when the filter is hidden. */
  readonly filterLines: readonly string[];
  /* Last registry refresh error, or an empty string. */
  readonly error: string;
}
